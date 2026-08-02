# backend/app/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class InterviewSessionCreate(BaseModel):
    job_title: str
    job_description: str
    language_preference: Optional[str] = "multilingual"

class InterviewSessionResponse(BaseModel):
    id: int
    candidate_name: str
    job_title: str
    job_description: str
    resume_text: Optional[str]
    language_preference: str
    created_at: datetime

    class Config:
        from_attributes = True