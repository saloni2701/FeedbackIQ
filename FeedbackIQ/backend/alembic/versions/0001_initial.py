"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-10-24
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "issues",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("aspect", sa.String(80), nullable=False),
        sa.Column("severity", sa.String(12), nullable=False),
        sa.Column("mentions", sa.Integer(), nullable=False),
        sa.Column("recency", sa.String(12), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("last_seen", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_issues_priority", "issues", ["priority"])
    op.create_table(
        "feature_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("theme", sa.String(80), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False),
    )
    op.create_table(
        "topics",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False),
        sa.Column("keywords", sa.JSON(), nullable=False),
    )
    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("source", sa.String(60), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("sentiment", sa.String(10), nullable=False),
        sa.Column("sentiment_score", sa.Float(), nullable=False),
        sa.Column("aspect", sa.String(80), nullable=True),
        sa.Column("is_feature_request", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("issue_id", sa.Integer(), sa.ForeignKey("issues.id", ondelete="SET NULL"), nullable=True),
        sa.Column("request_id", sa.Integer(), sa.ForeignKey("feature_requests.id", ondelete="SET NULL"), nullable=True),
        sa.Column("topic_id", sa.Integer(), sa.ForeignKey("topics.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_feedback_created_at", "feedback", ["created_at"])
    op.create_index("ix_feedback_aspect", "feedback", ["aspect"])
    op.create_index("ix_feedback_created_sentiment", "feedback", ["created_at", "sentiment"])


def downgrade() -> None:
    op.drop_table("feedback")
    op.drop_table("topics")
    op.drop_table("feature_requests")
    op.drop_index("ix_issues_priority", table_name="issues")
    op.drop_table("issues")
