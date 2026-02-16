import os
import smtplib
from email.message import EmailMessage


def send_contact_email(*, subject: str, body: str) -> None:
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")

    mail_to = os.getenv("MAIL_TO")
    mail_from = os.getenv("MAIL_FROM")

    if not all([username, password, mail_to, mail_from]):
        raise RuntimeError(
            "Missing SMTP_USERNAME/SMTP_PASSWORD/MAIL_TO/MAIL_FROM in .env"
        )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = mail_from
    msg["To"] = mail_to
    msg.set_content(body)

    # Gmail TLS flow
    with smtplib.SMTP(host, port) as server:
        server.ehlo()
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
