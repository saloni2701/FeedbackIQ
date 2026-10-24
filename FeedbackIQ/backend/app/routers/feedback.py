import io
from datetime import datetime

import pandas as pd
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import SessionLocal, get_db
from ..models import Feedback
from ..schemas import FeedbackIn, FeedbackItem, IngestResult, Sentiment
from ..services.ingest import ingest
from ..services.insights import rebuild_insights

router = APIRouter(prefix="/api", tags=["feedback"])
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def _rebuild_in_background() -> None:
    with SessionLocal() as db:
        rebuild_insights(db)


@router.get("/feedback", response_model=list[FeedbackItem])
def list_feedback(
    sentiment: Sentiment | None = None,
    q: str | None = None,
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    stmt = select(Feedback).order_by(Feedback.created_at.desc(), Feedback.id.desc())
    if sentiment:
        stmt = stmt.where(Feedback.sentiment == sentiment)
    if q:
        stmt = stmt.where(func.lower(Feedback.text).contains(q.lower(), autoescape=True))
    return [
        FeedbackItem(
            id=r.id, text=r.text, source=r.source, date=r.created_at.date(),
            sentiment=r.sentiment, aspect=r.aspect or "Other",
        )
        for r in db.scalars(stmt.limit(limit).offset(offset))
    ]


@router.post("/feedback", response_model=IngestResult, status_code=201)
def add_feedback(body: FeedbackIn, background: BackgroundTasks, db: Session = Depends(get_db)):
    added, skipped = ingest(db, [body.model_dump()])
    background.add_task(_rebuild_in_background)
    return IngestResult(added=added, skipped=skipped)


@router.post("/feedback/upload", response_model=IngestResult, status_code=201)
async def upload_feedback(background: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """CSV with a `text` column, plus optional `source` and `date` columns."""
    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File is too large. The limit is 5 MB.")
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception:
        raise HTTPException(400, "Could not read this file as CSV.")
    df.columns = [str(c).strip().lower() for c in df.columns]
    if "text" not in df.columns:
        raise HTTPException(400, "The CSV needs a column named “text”.")
    dates = pd.to_datetime(df["date"], errors="coerce") if "date" in df.columns else None
    items = []
    for i, row in df.iterrows():
        d = dates.iloc[i] if dates is not None and not pd.isna(dates.iloc[i]) else None
        items.append({
            "text": row["text"] if isinstance(row["text"], str) else "",
            "source": row["source"] if "source" in df.columns and isinstance(row["source"], str) else "Upload",
            "date": d.to_pydatetime().replace(tzinfo=None) if d is not None else datetime.utcnow(),
        })
    added, skipped = ingest(db, items)
    if added:
        background.add_task(_rebuild_in_background)
    return IngestResult(added=added, skipped=skipped)


@router.post("/analysis/run")
def run_analysis(db: Session = Depends(get_db)):
    """Recompute issues, feature requests and topics now."""
    rebuild_insights(db)
    return {"status": "ok"}
