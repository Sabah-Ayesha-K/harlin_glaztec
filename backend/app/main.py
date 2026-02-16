import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ContactRequest
from app.emailer import send_contact_email

load_dotenv()

app = FastAPI(title="Harlin GlazTec Backend")

# CORS for your frontend running on http.server 5500
origins = os.getenv("CORS_ORIGINS", "http://localhost:5500").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/contact")
def contact(payload: ContactRequest):
    # Honeypot anti-bot: if filled, treat as success but DO NOT send email
    if payload.company and payload.company.strip():
        return {"ok": True, "message": "Submitted"}  # silent success

    subject = f"Harlin Contact Form: {payload.name} ({payload.phone})"
    body = (
        "New contact form submission:\n\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Phone: {payload.phone}\n\n"
        f"Message:\n{payload.message}\n"
    )

    try:
        send_contact_email(subject=subject, body=body)
        return {"ok": True, "message": "Email sent"}
    except Exception as e:
        # log it later; keep response clean
        raise HTTPException(
            status_code=500, detail="Failed to send email"
        ) from e
