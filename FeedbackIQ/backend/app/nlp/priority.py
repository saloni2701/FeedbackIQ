"""Transparent issue prioritisation.

priority = 100 * (0.40 * frequency + 0.35 * severity + 0.25 * recency)

* frequency: log-scaled mentions relative to the most-mentioned issue (0-1)
* severity:  Critical 1.0, Major 0.75, Moderate 0.5, Minor 0.25
* recency:   mean exponential decay of each mention's age (half-life 14 days, 0-1)
"""
import math
from datetime import datetime

W_FREQ, W_SEV, W_REC = 0.40, 0.35, 0.25
HALF_LIFE_DAYS = 14
SEVERITY_WEIGHT = {"Critical": 1.0, "Major": 0.75, "Moderate": 0.5, "Minor": 0.25}


def frequency_score(mentions: int, max_mentions: int) -> float:
    if mentions <= 0 or max_mentions <= 0:
        return 0.0
    return min(1.0, math.log1p(mentions) / math.log1p(max_mentions))


def recency_score(dates: list[datetime], now: datetime) -> float:
    if not dates:
        return 0.0
    vals = [0.5 ** (max((now - d).total_seconds(), 0) / 86400 / HALF_LIFE_DAYS) for d in dates]
    return sum(vals) / len(vals)


def recency_label(dates: list[datetime], now: datetime) -> str:
    recent = sum(1 for d in dates if 0 <= (now - d).days < 14)
    prior = sum(1 for d in dates if 14 <= (now - d).days < 28)
    if recent > 0 and (prior == 0 or recent >= 1.25 * prior):
        return "Rising"
    if recent <= 0.75 * prior:
        return "Declining"
    return "Stable"


def priority_score(mentions: int, max_mentions: int, severity: str, dates: list[datetime], now: datetime) -> int:
    value = (
        W_FREQ * frequency_score(mentions, max_mentions)
        + W_SEV * SEVERITY_WEIGHT.get(severity, 0.25)
        + W_REC * recency_score(dates, now)
    )
    return round(100 * value)


def priority_level(score: int) -> str:
    return "high" if score >= 75 else "medium" if score >= 40 else "low"
