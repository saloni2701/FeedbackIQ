from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    aspect: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(12))  # Critical | Major | Moderate | Minor
    mentions: Mapped[int] = mapped_column(Integer)
    recency: Mapped[str] = mapped_column(String(12))  # Rising | Stable | Declining
    priority: Mapped[int] = mapped_column(Integer, index=True)  # 0-100
    last_seen: Mapped[datetime] = mapped_column(DateTime)


class FeatureRequest(Base):
    __tablename__ = "feature_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    theme: Mapped[str] = mapped_column(String(80))
    count: Mapped[int] = mapped_column(Integer)


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    count: Mapped[int] = mapped_column(Integer)
    keywords: Mapped[list] = mapped_column(JSON)


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (Index("ix_feedback_created_sentiment", "created_at", "sentiment"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(60), default="Feedback form")
    created_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    sentiment: Mapped[str] = mapped_column(String(10))  # positive | neutral | negative
    sentiment_score: Mapped[float] = mapped_column(Float)  # -1 to +1
    aspect: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    is_feature_request: Mapped[bool] = mapped_column(Boolean, default=False)
    issue_id: Mapped[int | None] = mapped_column(ForeignKey("issues.id", ondelete="SET NULL"), nullable=True)
    request_id: Mapped[int | None] = mapped_column(ForeignKey("feature_requests.id", ondelete="SET NULL"), nullable=True)
    topic_id: Mapped[int | None] = mapped_column(ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
