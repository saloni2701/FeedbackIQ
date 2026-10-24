"""Sentiment, aspect, feature-request and severity detection.

Heavy libraries are imported lazily so the rest of the app (and the tests) start fast.
"""
import re
from functools import lru_cache

from ..config import get_settings

ASPECT_KEYWORDS: dict[str, list[str]] = {
    "Billing and payments": ["payment", "charged", "charge", "refund", "invoice", "billing", "card", "checkout"],
    "Speed and performance": ["slow", "lag", "laggy", "loading", "load", "crash", "freez", "performance", "speed", "hang"],
    "Customer support": ["support", "agent", "reply", "replied", "response", "helpdesk", "ticket"],
    "Price and value": ["price", "expensive", "cheap", "cost", "value", "subscription", "worth", "afford"],
    "Reports and export": ["report", "export", "pdf", "download", "csv"],
    "Account and login": ["login", "log in", "password", "account", "sign in", "verify", "otp"],
    "Availability": ["offline", "without internet", "outage", "downtime", "unavailable"],
    "Ease of use": ["easy", "hard to find", "confusing", "layout", "menu", "navigation", "interface", "design", "intuitive", "search"],
}

FEATURE_PATTERNS = [
    r"\bwould (?:be|have been) (?:great|nice|good|helpful|amazing)\b",
    r"\bit would be (?:great|nice|good|helpful)\b",
    r"\bplease (?:add|include|support|make|let)\b",
    r"\bi wish\b",
    r"\b(?:can|could) you (?:please )?(?:add|include|support)\b",
    r"\bshould (?:have|include|support|allow)\b",
    r"\bneed (?:a|an|to be able to)\b",
    r"\bmissing\b",
    r"\bfeature request\b",
    r"\bwish (?:there|it|you)\b",
]
_FEATURE_RE = re.compile("|".join(FEATURE_PATTERNS), re.IGNORECASE)

SEVERITY_KEYWORDS: dict[str, list[str]] = {
    "Critical": ["charged twice", "double charged", "data loss", "lost my data", "fraud", "cannot log in", "can't log in",
                 "unable to pay", "payment fail", "payment keeps failing", "security", "crash", "not working at all"],
    "Major": ["slow", "broken", "fails", "failed", "error", "bug", "laggy", "freez", "does not work", "doesn't work"],
    "Moderate": ["wait", "waited", "delay", "confusing", "too long", "irrelevant", "annoying"],
}
SEVERITY_ORDER = ["Critical", "Major", "Moderate", "Minor"]


def detect_aspect(text: str) -> str:
    low = text.lower()
    best, best_hits = "Other", 0
    for aspect, words in ASPECT_KEYWORDS.items():
        hits = sum(1 for w in words if w in low)
        if hits > best_hits:
            best, best_hits = aspect, hits
    return best


def is_feature_request(text: str) -> bool:
    return bool(_FEATURE_RE.search(text))


def estimate_severity(texts: list[str]) -> str:
    """Highest severity found in any comment of a group (keyword based, easy to audit)."""
    found = "Minor"
    for t in texts:
        low = t.lower()
        for level in SEVERITY_ORDER[:3]:
            if any(k in low for k in SEVERITY_KEYWORDS[level]):
                if SEVERITY_ORDER.index(level) < SEVERITY_ORDER.index(found):
                    found = level
                break
    return found


@lru_cache
def _vader():
    import nltk
    from nltk.sentiment import SentimentIntensityAnalyzer

    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        nltk.download("vader_lexicon", quiet=True)
    sia = SentimentIntensityAnalyzer()
    sia.lexicon.update({
        "slow": -1.8, "failed": -2.0, "fails": -2.0, "crash": -2.5, "crashes": -2.5, "laggy": -2.0,
        "lag": -1.5, "broken": -2.2, "waited": -1.0, "error": -1.8, "confusing": -1.8, "expensive": -1.5,
    })
    return sia


@lru_cache
def _hf_pipeline():
    from transformers import pipeline

    return pipeline("text-classification", model=get_settings().sentiment_model, top_k=None, truncation=True, max_length=256)


def _label_from_score(score: float, threshold: float = 0.2) -> str:
    return "positive" if score >= threshold else "negative" if score <= -threshold else "neutral"


def analyze_sentiment(texts: list[str]) -> list[tuple[str, float]]:
    """Return (label, score) per text, where score runs from -1 (negative) to +1 (positive)."""
    if not texts:
        return []
    if get_settings().sentiment_backend == "transformers":
        legacy = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
        results = []
        for probs in _hf_pipeline()(texts, batch_size=32):
            p = {legacy.get(d["label"], d["label"]).lower(): d["score"] for d in probs}
            label = max(p, key=p.get)
            results.append((label, round(p.get("positive", 0.0) - p.get("negative", 0.0), 4)))
        return results
    sia = _vader()
    out = []
    for t in texts:
        c = sia.polarity_scores(t)["compound"]
        out.append((_label_from_score(c), round(c, 4)))
    return out
