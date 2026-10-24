from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import analytics, feedback

app = FastAPI(title="FeedbackIQ API", version="1.0.0", description="Turns customer feedback into product insights.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(analytics.router)
app.include_router(feedback.router)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}
