"""Load sample feedback so the dashboard has something to show.

Usage:  python -m scripts.seed [--reset] [--count 240]
"""
import argparse
import random
from datetime import datetime, timedelta

from sqlalchemy import delete

from app.database import SessionLocal
from app.models import Feedback, FeatureRequest, Issue, Topic
from app.services.ingest import ingest
from app.services.insights import rebuild_insights

SAMPLES = {
    "slow": ["Everything has become very slow since the last update.", "The app is laggy and takes ages to load.",
             "Loading screens are painfully slow now.", "Performance dropped badly after the new version."],
    "payment": ["My card was charged twice and retrying the payment failed.", "Payment keeps failing at checkout.",
                "I was charged but the order did not go through."],
    "support_bad": ["Waited three days for a reply from support.", "Support replies take too long.",
                    "Nobody from the support team answered my ticket."],
    "support_good": ["Support was helpful and answered within the hour.", "The agent solved my problem quickly."],
    "ui_good": ["Loved the new layout, much easier to find things.", "The interface is clean and easy to use.",
                "Navigation is intuitive and simple."],
    "ui_bad": ["The menu is hard to find.", "Navigation is confusing."],
    "price": ["The price is fair for what you get.", "Great value for the subscription.", "Too expensive for the features offered."],
    "request": ["Would be great to use the app without internet.", "Please add a way to download reports as PDF.",
                "It would be nice to have dark mode.", "I wish I could share dashboards with a link."],
}
SOURCES = ["Review", "Survey", "Support ticket", "Feedback form"]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--reset", action="store_true", help="delete existing data first")
    ap.add_argument("--count", type=int, default=240)
    args = ap.parse_args()

    rng = random.Random(42)
    now = datetime.utcnow()
    items = []
    for _ in range(args.count):
        days_ago = rng.randint(0, 55)
        weights = {"slow": 1 + (55 - days_ago) / 18, "payment": 1.2, "support_bad": 1.4, "support_good": 1.2,
                   "ui_good": 2.5, "ui_bad": 0.6, "price": 1.5, "request": 1.3}
        key = rng.choices(list(weights), weights=list(weights.values()))[0]
        items.append({
            "text": rng.choice(SAMPLES[key]),
            "source": rng.choice(SOURCES),
            "date": now - timedelta(days=days_ago, hours=rng.randint(0, 23)),
        })

    with SessionLocal() as db:
        if args.reset:
            for model in (Feedback, Issue, FeatureRequest, Topic):
                db.execute(delete(model))
            db.commit()
        added, _ = ingest(db, items)
        rebuild_insights(db)
        print(f"Added {added} comments and rebuilt insights.")


if __name__ == "__main__":
    main()
