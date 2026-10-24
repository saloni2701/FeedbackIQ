"""Group similar comments so repeated complaints and requests count as one issue."""
from functools import lru_cache

import numpy as np

from ..config import get_settings


@lru_cache
def _sbert():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(get_settings().embedding_model)


def embed(texts: list[str]) -> np.ndarray:
    """L2-normalised vectors, one row per text."""
    if get_settings().embedding_backend == "sentence-transformers":
        return np.asarray(_sbert().encode(texts, normalize_embeddings=True, show_progress_bar=False))
    from sklearn.feature_extraction.text import TfidfVectorizer

    matrix = TfidfVectorizer(stop_words="english", ngram_range=(1, 2)).fit_transform(texts).toarray()
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    return matrix / np.where(norms == 0, 1, norms)


def group_similar(texts: list[str]) -> list[tuple[list[int], int]]:
    """Return (member indexes, representative index) for each group of similar texts."""
    n = len(texts)
    if n == 0:
        return []
    if n == 1:
        return [([0], 0)]
    try:
        vectors = embed(texts)
    except ValueError:  # e.g. empty vocabulary when every word is a stop word
        return [([i], i) for i in range(n)]

    from sklearn.cluster import AgglomerativeClustering

    labels = AgglomerativeClustering(
        n_clusters=None, metric="cosine", linkage="average",
        distance_threshold=get_settings().cluster_distance_threshold,
    ).fit_predict(vectors)

    groups: list[tuple[list[int], int]] = []
    for label in sorted(set(labels)):
        idx = [i for i, l in enumerate(labels) if l == label]
        centroid = vectors[idx].mean(axis=0)
        rep = idx[int(np.argmax(vectors[idx] @ centroid))]
        groups.append((idx, rep))
    return groups
