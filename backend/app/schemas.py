from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=20)
    message: str = Field(min_length=5, max_length=2000)

    # honeypot: should be empty for real users
    company: str | None = ""
