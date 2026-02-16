import os
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

DB_PATH = Path(os.getenv("DB_PATH", "harlin.db"))


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    # ensure the file exists early
    DB_PATH.touch(exist_ok=True)

    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,

                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                message TEXT NOT NULL,

                is_spam INTEGER NOT NULL DEFAULT 0,

                company_mail_sent INTEGER NOT NULL DEFAULT 0,
                company_mail_error TEXT,

                autoreply_sent INTEGER NOT NULL DEFAULT 0,
                autoreply_error TEXT
            )
            """
        )
        conn.commit()


def insert_submission(
    *,
    name: str,
    email: str,
    phone: str,
    message: str,
    is_spam: bool,
) -> int:
    created_at = datetime.utcnow().isoformat() + "Z"
    with get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO contact_submissions
            (created_at, name, email, phone, message, is_spam)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (created_at, name, email, phone, message, 1 if is_spam else 0),
        )
        conn.commit()
        return int(cur.lastrowid)


def update_mail_status(
    submission_id: int,
    *,
    company_mail_sent: Optional[bool] = None,
    company_mail_error: Optional[str] = None,
    autoreply_sent: Optional[bool] = None,
    autoreply_error: Optional[str] = None,
) -> None:
    fields: Dict[str, Any] = {}

    if company_mail_sent is not None:
        fields["company_mail_sent"] = 1 if company_mail_sent else 0
    if company_mail_error is not None:
        fields["company_mail_error"] = company_mail_error
    if autoreply_sent is not None:
        fields["autoreply_sent"] = 1 if autoreply_sent else 0
    if autoreply_error is not None:
        fields["autoreply_error"] = autoreply_error

    if not fields:
        return

    set_clause = ", ".join([f"{k}=?" for k in fields.keys()])
    values = list(fields.values()) + [submission_id]

    with get_conn() as conn:
        query = f"UPDATE contact_submissions SET {set_clause} WHERE id=?"
        conn.execute(query, values)
        conn.commit()
