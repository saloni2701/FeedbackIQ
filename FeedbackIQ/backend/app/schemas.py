"""Response shapes. They mirror src/types.ts in the frontend (camelCase on the wire)."""
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Sentiment = Literal["positive", "neutral", "negative"]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class FeedbackItem(CamelModel):
    id: int
    text: str
    source: str
    date: date
    sentiment: Sentiment
    aspect: str


class FeedbackIn(CamelModel):
    text: str = Field(min_length=3, max_length=5000)
    source: str = Field(default="Feedback form", max_length=60)
    date: datetime | None = None


class IssueOut(CamelModel):
    id: int
    title: str
    aspect: str
    mentions: int
    severity: str
    recency: str
    priority: int


class FeatureRequestOut(CamelModel):
    id: int
    title: str
    count: int
    theme: str


class AspectSentiment(CamelModel):
    aspect: str
    mentions: int
    positive: int
    neutral: int
    negative: int


class TrendPoint(CamelModel):
    week: str
    positive: int
    neutral: int
    negative: int


class TopicOut(CamelModel):
    name: str
    count: int
    keywords: list[str]


class Summary(CamelModel):
    total: int
    total_change: float
    net_sentiment: float
    open_issues: int
    high_priority: int
    requests: int
    request_themes: int
    headline: str
    recommendations: list[str]


class IngestResult(CamelModel):
    added: int
    skipped: int = 0
