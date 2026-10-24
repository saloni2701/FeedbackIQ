from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import models as _auth_models  # noqa: F401  (registers the users table)
from .auth.deps import get_current_user
from .auth.router import router as auth_router
from .config import get_settings
from .routers import analytics, feedback

app = FastAPI(title="FeedbackIQ API", version="1.1.0", description="Turns customer feedback into product insights.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Sign-up and sign-in are public; everything else needs a valid token.
app.include_router(auth_router)
protected = [Depends(get_current_user)]
app.include_router(analytics.router, dependencies=protected)
app.include_router(feedback.router, dependencies=protected)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}
