from datetime import datetime, timedelta

from app.nlp.priority import priority_level, priority_score, recency_label

NOW = datetime(2026, 10, 24)


def days(*ago):
    return [NOW - timedelta(days=d) for d in ago]


def test_more_severe_and_frequent_scores_higher():
    high = priority_score(300, 300, "Critical", days(1, 2, 3), NOW)
    low = priority_score(10, 300, "Minor", days(50, 55), NOW)
    assert high > low
    assert 0 <= low <= high <= 100


def test_recency_label():
    assert recency_label(days(1, 2, 3, 4), NOW) == "Rising"
    assert recency_label(days(1, 15, 16, 17, 18), NOW) == "Declining"
    assert recency_label(days(2, 3, 16, 17), NOW) == "Stable"


def test_levels():
    assert priority_level(80) == "high"
    assert priority_level(50) == "medium"
    assert priority_level(10) == "low"
