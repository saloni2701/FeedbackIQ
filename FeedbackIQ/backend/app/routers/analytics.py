from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Feedback, FeatureRequest, Issue, Topic
from ..schemas import AspectSentiment, FeatureRequestOut, IssueOut, Summary, TopicOut, TrendPoint
from ..services.narrative import headline, recommendations

router = APIRouter(prefix="/api", tags=["analytics"])


def _percents(pos: int, neu: int, neg: int) -> tuple[int, int, int]:
    n = pos + neu + neg
    if n == 0:
        return 0, 0, 0
    p, g = round(100 * pos / n), round(100 * neg / n)
    return p, max(0, 100 - p - g), g


@router.get("/summary", response_model=Summary)
def summary(weeks: int = Query(8, ge=1, le=52), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    start = now - timedelta(weeks=weeks)
    prev_start = start - timedelta(weeks=weeks)

    counts = dict(db.execute(
        select(Feedback.sentiment, func.count()).where(Feedback.created_at >= start).group_by(Feedback.sentiment)
    ).all())
    total = sum(counts.values())
    prev = db.scalar(select(func.count()).where(Feedback.created_at >= prev_start, Feedback.created_at < start)) or 0
    change = round((total - prev) / prev * 100, 1) if prev else 0.0
    net = round((counts.get("positive", 0) - counts.get("negative", 0)) / total, 2) if total else 0.0

    issues = list(db.scalars(select(Issue).order_by(Issue.priority.desc(), Issue.mentions.desc())))
    requests = list(db.scalars(select(FeatureRequest).order_by(FeatureRequest.count.desc())))
    return Summary(
        total=total,
        total_change=change,
        net_sentiment=net,
        open_issues=len(issues),
        high_priority=sum(1 for i in issues if i.priority >= 75),
        requests=sum(r.count for r in requests),
        request_themes=len(requests),
        headline=headline(net, issues, total),
        recommendations=recommendations(issues, requests),
    )


@router.get("/trends", response_model=list[TrendPoint])
def trends(weeks: int = Query(8, ge=2, le=52), db: Session = Depends(get_db)):
    start = datetime.utcnow() - timedelta(weeks=weeks)
    week = func.date_trunc("week", Feedback.created_at).label("w")
    rows = db.execute(
        select(week, Feedback.sentiment, func.count()).where(Feedback.created_at >= start).group_by(week, Feedback.sentiment).order_by(week)
    ).all()
    buckets: dict = defaultdict(lambda: {"positive": 0, "neutral": 0, "negative": 0})
    for w, sentiment, n in rows:
        buckets[w][sentiment] = n
    out = []
    for i, w in enumerate(sorted(buckets), start=1):
        b = buckets[w]
        pos, neu, neg = _percents(b["positive"], b["neutral"], b["negative"])
        out.append(TrendPoint(week=f"W{i}", positive=pos, neutral=neu, negative=neg))
    return out


@router.get("/aspects", response_model=list[AspectSentiment])
def aspects(weeks: int = Query(8, ge=1, le=52), db: Session = Depends(get_db)):
    start = datetime.utcnow() - timedelta(weeks=weeks)

    def count_of(s: str):
        return func.sum(case((Feedback.sentiment == s, 1), else_=0))

    rows = db.execute(
        select(Feedback.aspect, func.count(), count_of("positive"), count_of("neutral"), count_of("negative"))
        .where(Feedback.created_at >= start, Feedback.aspect.is_not(None), Feedback.aspect != "Other")
        .group_by(Feedback.aspect)
        .order_by(func.count().desc())
        .limit(6)
    ).all()
    result = []
    for aspect, n, pos, neu, neg in rows:
        p, u, g = _percents(int(pos), int(neu), int(neg))
        result.append(AspectSentiment(aspect=aspect, mentions=n, positive=p, neutral=u, negative=g))
    return result


@router.get("/issues", response_model=list[IssueOut])
def issues(db: Session = Depends(get_db)):
    return list(db.scalars(select(Issue).order_by(Issue.priority.desc(), Issue.mentions.desc())))


@router.get("/feature-requests", response_model=list[FeatureRequestOut])
def feature_requests(db: Session = Depends(get_db)):
    return list(db.scalars(select(FeatureRequest).order_by(FeatureRequest.count.desc())))


@router.get("/topics", response_model=list[TopicOut])
def topics(db: Session = Depends(get_db)):
    return list(db.scalars(select(Topic).order_by(Topic.count.desc()).limit(8)))
