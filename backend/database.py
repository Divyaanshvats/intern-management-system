import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

# Use Postgres URL if provided, otherwise fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ims.db")

# SQLite requires different connect_args than Postgres
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Postgres configuration
    # Vercel/Supabase URLs usually start with postgres:// but SQLAlchemy 1.4+ needs postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Robustly remove ?pgbouncer=true or &pgbouncer=true which causes issues with psycopg2 logic
    if "pgbouncer=true" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")
        
    # Use NullPool for Serverless (Vercel) to prevent intermittent connection errors
    # This ensures a fresh connection for every request, avoiding stale pooling issues.
    engine = create_engine(DATABASE_URL, poolclass=NullPool)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()