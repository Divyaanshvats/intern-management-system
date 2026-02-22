import sqlite3
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys
import urllib.parse

# Add backend to path so we can import models
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))
from backend import models

def migrate_data(user, password, host, port, dbname):
    print("\n--- Starting migration from SQLite to Postgres ---")
    
    # 1. Connect to SQLite
    sqlite_path = "backend/ims.db"
    if not os.path.exists(sqlite_path):
        print(f"Error: {sqlite_path} not found. Run from project root.")
        return

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    # 2. Build encoded Postgres URL
    encoded_pass = urllib.parse.quote_plus(password)
    postgres_url = f"postgresql://{user}:{encoded_pass}@{host}:{port}/{dbname}"
    
    pg_session = None
    try:
        print(f"Connecting to host: {host}...")
        pg_engine = create_engine(postgres_url)
        # Test connection
        conn = pg_engine.connect()
        conn.close()
        
        pg_session_factory = sessionmaker(bind=pg_engine)
        pg_session = pg_session_factory()
        
        # Create tables in Postgres
        models.Base.metadata.create_all(bind=pg_engine)
        
        # Migrate Users
        print("Migrating Users...")
        sqlite_cursor.execute("SELECT name, email, password, role, is_active FROM users")
        users_data = sqlite_cursor.fetchall()
        for u in users_data:
            new_user = models.User(
                name=u[0],
                email=u[1],
                password=u[2],
                role=u[3],
                is_active=u[4]  # Keep as integer (1/0)
            )
            pg_session.merge(new_user)
        
        # Migrate Evaluations
        print("Migrating Evaluations...")
        sqlite_cursor.execute("SELECT id, manager_id, intern_id, rating, manager_comment, months_worked, intern_comment, status, hr_comment, hr_rating_adjustment, report FROM evaluations")
        eval_data = sqlite_cursor.fetchall()
        for e in eval_data:
            new_eval = models.Evaluation(
                id=e[0],
                manager_id=e[1],
                intern_id=e[2],
                rating=e[3],
                manager_comment=e[4],
                months_worked=e[5],
                intern_comment=e[6],
                status=e[7],
                hr_comment=e[8],
                hr_rating_adjustment=e[9],
                report=e[10]
            )
            pg_session.merge(new_eval)
        
        pg_session.commit()
        print("\n✅ SUCCESS: Migration completed successfully!")
        print("Your data is now in the cloud.")
        
    except Exception as err:
        print(f"\n❌ FAILED: Connection error.")
        print(f"Details: {err}")
        if "Tenant or user not found" in str(err):
            print("\n💡 TIP: For Supabase Poolers, your username must be: postgres.[YOUR-PROJECT-ID]")
            print("Example: postgres.abcde-fghij-klmno")
    finally:
        if pg_session:
            pg_session.close()
        sqlite_conn.close()

if __name__ == "__main__":
    print("--- Supabase/Postgres Migration Tool ---")
    print("Please enter your database details carefully from your connection string.\n")
    
    host = input("1. Host (e.g. aws-0-...pooler.supabase.com): ").strip()
    password = input("2. Database Password: ").strip()
    
    user_default = "postgres"
    print(f"\n3. User (For Supabase Pooler, use format: postgres.[project-id])")
    user = input(f"   Enter Username [default: {user_default}]: ").strip() or user_default
    
    port = input("4. Port [default: 5432]: ").strip() or "5432"
    dbname = input("5. Database Name [default: postgres]: ").strip() or "postgres"
    
    if not host or not password:
        print("Error: Host and Password are required.")
    else:
        migrate_data(user, password, host, port, dbname)
