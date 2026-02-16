import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ContactRequest
from app.emailer import send_email
from app.db import init_db, insert_submission, update_mail_status

# Ensure .env is loaded from backend/.env no matter where uvicorn is run from
ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH)

app = FastAPI(title="Harlin GlazTec Backend")

origins = os.getenv(
    "CORS_ORIGINS", "http://127.0.0.1:5500,http://localhost:5500"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAIL_TO = os.getenv("MAIL_TO", "")
AUTO_REPLY_ENABLED = os.getenv("AUTO_REPLY_ENABLED", "true").lower() == "true"


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/contact")
def contact(payload: ContactRequest):
    is_spam = bool(payload.company and payload.company.strip())

    # 1) Always store first
    submission_id = insert_submission(
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        message=payload.message,
        is_spam=is_spam,
    )

    # If spam: pretend ok, but don't email
    if is_spam:
        return {"ok": True, "message": "Submitted"}

    # 2) Company email
    company_subject = f"Harlin Contact Form: {payload.name} ({payload.phone})"
    company_body = (
        "New contact form submission:\n\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Phone: {payload.phone}\n\n"
        f"Message:\n{payload.message}\n\n"
        f"Submission ID: {submission_id}\n"
    )

    try:
        if not MAIL_TO:
            raise RuntimeError("MAIL_TO is empty in .env")
        send_email(
            to_email=MAIL_TO,
            subject=company_subject,
            body=company_body
        )
        update_mail_status(
            submission_id,
            company_mail_sent=True,
            company_mail_error=None
        )
    except Exception as e:
        # Don't lose the lead; just record failure
        update_mail_status(
            submission_id,
            company_mail_sent=False,
            company_mail_error=str(e)
        )
        return {
            "ok": True,
            "message": (
                "Saved in database. Email sending failed, "
                "but your request is recorded."
            )
        }

    # 3) Auto reply to customer
    if AUTO_REPLY_ENABLED:
        customer_subject = "Thanks for contacting Harlin GlazTec"
        customer_body = (
            f"Hi {payload.name},\n\n"
            "Thank you for contacting Harlin GlazTec. "
            "We have received your request and will get back to you "
            "shortly.\n\n"
            "Regards,\n"
            "Harlin GlazTec Team"
        )
        try:
            send_email(
                to_email=str(payload.email),
                subject=customer_subject,
                body=customer_body
            )
            update_mail_status(
                submission_id,
                autoreply_sent=True,
                autoreply_error=None
            )
        except Exception as e:
            update_mail_status(
                submission_id,
                autoreply_sent=False,
                autoreply_error=str(e)
            )

    return {
        "ok": True,
        "message": (
            "Message sent successfully........ "
        )
    }
