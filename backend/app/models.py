# backend/app/models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(100), default="Candidate")
    job_title = Column(String(255), nullable=False)
    resume_text = Column(Text, nullable=True)
    job_description = Column(Text, nullable=False)
    language_preference = Column(String(50), default="multilingual")
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship("InterviewResponse", back_populates="session", cascade="all, delete-orphan")


class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    
    question = Column(Text, nullable=False)
    user_transcript = Column(Text, nullable=True)
    detected_language = Column(String(50), default="multilingual")
    ai_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="responses")