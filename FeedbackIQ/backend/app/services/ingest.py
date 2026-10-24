from datetime import datetime

from sqlalchemy.orm import Session

from ..models import Feedback
from ..nlp.analyzer import analyze_sentiment, detect_aspect, is_feature_request


def ingest(db: Session, items: list[dict]) -> tuple[int, int]:
    """Analyse and store comments. Returns (added, skipped)."""
    valid = [i for i in items if isinstance(i.get("text"), str) and len(i["text"].strip()) >= 3]
    skipped = len(items) - len(valid)
    if not valid:
        return 0, skipped

    texts = [i["text"].strip() for i in valid]
    sentiments = analyze_sentiment(texts)
    now = datetime.utcnow()
    db.add_all(
        Feedback(
            text=text,
            source=(item.get("source") or "Feedback form")[:60],
            created_at=item.get("date") or now,
            sentiment=label,
            sentiment_score=score,
            aspect=detect_aspect(text),
            is_feature_request=is_feature_request(text),
        )
        for item, text, (label, score) in zip(valid, texts, sentiments)
    )
    db.commit()
    return len(valid), skipped
