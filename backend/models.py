from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    is_active = Column(Integer, default=1) # 1 for active, 0 for inactive


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)

    intern_id = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    manager_comment = Column(Text, nullable=False)
    manager_id = Column(String, nullable=False)
    months_worked = Column(Integer, nullable=False)

    intern_comment = Column(Text, nullable=True)
    hr_comment = Column(Text, nullable=True)
    hr_rating_adjustment = Column(Integer, nullable=True)

    status = Column(String, default="pending_intern")

    report = Column(Text, nullable=True)  # 👈 NEW FIELD

    created_at = Column(DateTime, default=datetime.utcnow)
