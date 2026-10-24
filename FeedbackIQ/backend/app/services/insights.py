"""Rebuilds issues, feature requests and topics from analysed feedback."""
from collections import Counter, defaultdict
from datetime import datetime

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from ..models import Feedback, FeatureRequest, Issue, Topic
from ..nlp.analyzer import estimate_severity
from ..nlp.embeddings import group_similar
from ..nlp.priority import priority_score, recency_label
from ..nlp.topics import extract_topics


def _title(text: str, limit: int = 80) -> str:
    first = text.strip().split("\n")[0]
    for sep in (". ", "! ", "? "):
        first = first.split(sep)[0]
    first = first.rstrip(".!? ")
    first = first[:1].upper() + first[1:]
    return first if len(first) <= limit else first[: limit - 1].rstrip() + "…"


def _build_issues(db: Session, rows: list[Feedback], now: datetime) -> None:
    by_aspect: dict[str, list[Feedback]] = defaultdict(list)
    for r in rows:
        if r.sentiment == "negative" and not r.is_feature_request:
            by_aspect[r.aspect or "Other"].append(r)

    clusters = []
    for aspect, items in by_aspect.items():
        for idx, rep in group_similar([r.text for r in items]):
            members = [items[i] for i in idx]
            clusters.append((aspect, members, items[rep].text))
    max_mentions = max((len(m) for _, m, _ in clusters), default=0)

    for aspect, members, rep_text in clusters:
        dates = [m.created_at for m in members]
        severity = estimate_severity([m.text for m in members])
        issue = Issue(
            title=_title(rep_text),
            aspect=aspect,
            severity=severity,
            mentions=len(members),
            recency=recency_label(dates, now),
            priority=priority_score(len(members), max_mentions, severity, dates, now),
            last_seen=max(dates),
        )
        db.add(issue)
        db.flush()
        for m in members:
            m.issue_id = issue.id


def _build_requests(db: Session, rows: list[Feedback]) -> None:
    items = [r for r in rows if r.is_feature_request]
    for idx, rep in group_similar([r.text for r in items]):
        members = [items[i] for i in idx]
        theme = Counter(m.aspect or "Other" for m in members).most_common(1)[0][0]
        req = FeatureRequest(title=_title(items[rep].text), theme=theme, count=len(members))
        db.add(req)
        db.flush()
        for m in members:
            m.request_id = req.id


def _build_topics(db: Session, rows: list[Feedback]) -> None:
    if not rows:
        return
    texts = [r.text for r in rows]
    for t in extract_topics(texts, [r.aspect or "Other" for r in rows]):
        topic = Topic(name=t["name"], count=len(t["indices"]), keywords=t["keywords"])
        db.add(topic)
        db.flush()
        for i in t["indices"]:
            rows[i].topic_id = topic.id


def rebuild_insights(db: Session) -> None:
    now = datetime.utcnow()
    db.execute(update(Feedback).values(issue_id=None, request_id=None, topic_id=None))
    db.execute(delete(Issue))
    db.execute(delete(FeatureRequest))
    db.execute(delete(Topic))
    rows = list(db.scalars(select(Feedback).order_by(Feedback.id)))
    _build_issues(db, rows, now)
    _build_requests(db, rows)
    _build_topics(db, rows)
    db.commit()
