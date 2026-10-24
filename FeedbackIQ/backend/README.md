# FeedbackIQ Backend

FastAPI + PostgreSQL + NLP service for FeedbackIQ: Transforming Customer Feedback into Product Insights.
It returns exactly the data shapes the React frontend expects (see `src/types.ts` there).

## Stack
Python, FastAPI, PostgreSQL, SQLAlchemy 2, Alembic, Pandas, NumPy, Scikit-learn, NLTK, Transformers, Sentence Transformers, BERTopic.

## Run locally
```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
docker compose up -d db                                # PostgreSQL (or use your own and edit DATABASE_URL)
alembic upgrade head                                   # create tables
python -m scripts.seed                                 # optional: load sample feedback
uvicorn app.main:app --reload                          # http://localhost:8000/docs
```
Then in the frontend `.env` set `VITE_USE_MOCK=false` and `VITE_API_URL=http://localhost:8000`.

Tests: `pip install -r requirements-dev.txt && pytest`

## API
| Method | Route | Returns |
| --- | --- | --- |
| GET | `/api/summary?weeks=8` | totals, net mood, counts, plain-language headline and next steps |
| GET | `/api/trends?weeks=8` | weekly positive / neutral / negative percentages |
| GET | `/api/aspects` | sentiment split per product aspect |
| GET | `/api/issues` | issues ranked by priority score |
| GET | `/api/feature-requests` | grouped feature requests |
| GET | `/api/topics` | discovered topics with keywords |
| GET | `/api/feedback?sentiment=&q=&limit=&offset=` | analysed comments |
| POST | `/api/feedback` | add one comment (`{"text": "...", "source": "...", "date": "..."}`) |
| POST | `/api/feedback/upload` | CSV upload with a `text` column (optional `source`, `date`) |
| POST | `/api/analysis/run` | rebuild issues, requests and topics now |
| GET | `/health` | health check |

Adding feedback analyses each comment immediately, then rebuilds issues, requests and topics in the background.

## How the analysis works
1. **Sentiment**: VADER (default, light) or a Transformers model (`SENTIMENT_BACKEND=transformers`).
2. **Aspects**: keyword lexicon in `app/nlp/analyzer.py`. Edit it to match your product.
3. **Feature requests**: phrase patterns such as "please add" and "it would be nice".
4. **Grouping**: similar negative comments and requests are clustered (TF-IDF by default, or Sentence Transformers with `EMBEDDING_BACKEND=sentence-transformers`).
5. **Topics**: BERTopic once there are at least `MIN_BERTOPIC_DOCS` comments, otherwise keyword groups per aspect.
6. **Priority score (0-100)**, shown openly in `app/nlp/priority.py`:
   `100 × (0.40 × frequency + 0.35 × severity + 0.25 × recency)`.
   Frequency is log-scaled mentions, severity comes from keywords (Critical, Major, Moderate, Minor), and recency uses a 14-day half-life.

## Limitations (also in your synopsis)
- Sarcasm and ambiguous comments can be misclassified. Insight text is rule-generated and should be reviewed by a person.
- English only for now.
- Issue titles are a representative comment from each group, so rename them if you want cleaner wording.
- The first VADER run downloads a small lexicon; Transformers and Sentence Transformers download models on first use.
- Keep `torch` out of production images unless you use the Transformers backends.

## Structure
```
app/
  main.py, config.py, database.py, models.py, schemas.py
  routers/   analytics.py, feedback.py
  nlp/       analyzer.py, priority.py, embeddings.py, topics.py
  services/  ingest.py, insights.py, narrative.py
alembic/     migrations
scripts/     seed.py
tests/
```
