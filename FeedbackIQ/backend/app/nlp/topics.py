"""Topic discovery: BERTopic when there is enough data, otherwise keyword groups per aspect."""
from collections import defaultdict

from ..config import get_settings


def _tfidf_keywords(texts: list[str], k: int = 4) -> list[str]:
    from sklearn.feature_extraction.text import TfidfVectorizer

    try:
        vec = TfidfVectorizer(stop_words="english", max_features=500)
        scores = vec.fit_transform(texts).sum(axis=0).A1
    except ValueError:
        return []
    terms = vec.get_feature_names_out()
    return [terms[i] for i in scores.argsort()[::-1][:k]]


def _bertopic(texts: list[str]) -> list[dict]:
    from bertopic import BERTopic

    model = BERTopic(min_topic_size=max(5, len(texts) // 50), verbose=False)
    assignments, _ = model.fit_transform(texts)
    members: dict[int, list[int]] = defaultdict(list)
    for i, topic_id in enumerate(assignments):
        if topic_id != -1:
            members[topic_id].append(i)
    out = []
    for topic_id, idx in members.items():
        words = [w for w, _ in model.get_topic(topic_id)][:4]
        out.append({"name": ", ".join(words[:3]).capitalize(), "keywords": words, "indices": idx})
    return out


def _by_aspect(texts: list[str], aspects: list[str]) -> list[dict]:
    members: dict[str, list[int]] = defaultdict(list)
    for i, a in enumerate(aspects):
        if a != "Other":
            members[a].append(i)
    return [
        {"name": a, "keywords": _tfidf_keywords([texts[i] for i in idx]), "indices": idx}
        for a, idx in members.items()
    ]


def extract_topics(texts: list[str], aspects: list[str]) -> list[dict]:
    """Each topic: {name, keywords, indices}."""
    if len(texts) >= get_settings().min_bertopic_docs:
        try:
            topics = _bertopic(texts)
            if topics:
                return topics
        except Exception:  # fall back rather than fail the whole analysis run
            pass
    return _by_aspect(texts, aspects)
