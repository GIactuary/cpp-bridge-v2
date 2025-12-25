import sqlite3
import json
import uuid
from datetime import datetime
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path("leads.db")


def init_db():
    """Initialize the database with required tables."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                -- Contact Info
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                partner_id TEXT,

                -- Calculator Inputs
                gender TEXT,
                current_age INTEGER,
                cpp_estimate_at_65 REAL,
                rrsp_savings REAL,
                health_status TEXT,
                bridge_cost REAL,
                is_affordable BOOLEAN,
                win_probability REAL,
                breakeven_age INTEGER,

                -- Quiz Answers (JSON blob)
                quiz_answers_json TEXT,

                -- Calculated Scores
                total_score INTEGER,
                score_category TEXT,
                income_score INTEGER,
                assets_score INTEGER,
                tax_score INTEGER,
                psychology_score INTEGER,

                -- Tracking
                email_sent BOOLEAN DEFAULT FALSE,
                email_sent_at TIMESTAMP
            )
        """)

        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_partner ON leads(partner_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)")


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def save_lead(lead_data: dict, score_data: dict) -> str:
    """Save a lead to the database and return the UUID."""
    lead_uuid = str(uuid.uuid4())

    with get_db() as conn:
        conn.execute("""
            INSERT INTO leads (
                uuid, name, email, partner_id,
                gender, current_age, cpp_estimate_at_65, rrsp_savings,
                health_status, bridge_cost, is_affordable, win_probability, breakeven_age,
                quiz_answers_json,
                total_score, score_category, income_score, assets_score, tax_score, psychology_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            lead_uuid,
            lead_data['name'],
            lead_data['email'],
            lead_data.get('partner_id'),
            lead_data['calculator_data']['gender'],
            lead_data['calculator_data']['current_age'],
            lead_data['calculator_data']['cpp_estimate_at_65'],
            lead_data['calculator_data']['rrsp_savings'],
            lead_data['calculator_data']['health_status'],
            lead_data['calculator_data']['bridge_cost'],
            lead_data['calculator_data']['is_affordable'],
            lead_data['calculator_data']['win_probability'],
            lead_data['calculator_data']['breakeven_age'],
            json.dumps(lead_data['quiz_answers']),
            score_data['total'],
            score_data['category'],
            score_data['breakdown']['quiz']['income']['points'],
            score_data['breakdown']['quiz']['assets']['points'],
            score_data['breakdown']['quiz']['tax']['points'],
            score_data['breakdown']['quiz']['psychology']['points'],
        ))

    return lead_uuid


def mark_email_sent(lead_uuid: str):
    """Mark a lead's email as sent."""
    with get_db() as conn:
        conn.execute(
            "UPDATE leads SET email_sent = TRUE, email_sent_at = ? WHERE uuid = ?",
            (datetime.now(), lead_uuid)
        )


def get_all_leads():
    """Get all leads for CSV export."""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM leads ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]


def get_leads_by_partner(partner_id: str):
    """Get leads for a specific partner."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM leads WHERE partner_id = ? ORDER BY created_at DESC",
            (partner_id,)
        )
        return [dict(row) for row in cursor.fetchall()]


# Initialize DB on import
init_db()
