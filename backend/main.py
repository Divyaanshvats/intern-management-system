from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
from dotenv import load_dotenv
import os

load_dotenv()
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role
)
from ai_service import generate_evaluation_report
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class LoginRequest(BaseModel):
    email: str
    password: str

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register")
def register(name: str, email: str, password: str, role: str, invite_code: str = None, db: Session = Depends(get_db)):
    # Invite Code Check for privileged roles
    if role in ["manager", "hr"]:
        import os
        actual_code = os.getenv("REGISTRATION_KEY", "ALGO8_2024") 
        if invite_code != actual_code:
            raise HTTPException(status_code=401, detail="Invalid invite code for Manager/HR")

    if role not in ["manager", "intern", "hr"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(password)

    new_user = models.User(
        name=name,
        email=email,
        password=hashed_pw,
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

from fastapi import Form

@app.post("/login")
def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact HR.")

    token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return {"access_token": token, "token_type": "bearer"}
@app.post("/create-evaluation")
def create_evaluation(
    intern_id: str,
    rating: int,
    manager_comment: str,
    months_worked: int,
    user: dict = Depends(require_role("manager")),
    db: Session = Depends(get_db)
):

    # ✅ VALIDATION STARTS HERE
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    if months_worked <= 0:
        raise HTTPException(status_code=400, detail="Months worked must be positive")
    # ✅ VALIDATION ENDS HERE

    new_evaluation = models.Evaluation(
        intern_id=intern_id,
        rating=rating,
        manager_comment=manager_comment,
        manager_id=user["email"],
        months_worked=months_worked
    )

    db.add(new_evaluation)
    db.commit()
    db.refresh(new_evaluation)

    return {"message": "Evaluation created successfully"}
@app.post("/submit-intern-feedback")
def submit_intern_feedback(
    evaluation_id: int,
    comment: str,
    user: dict = Depends(require_role("intern")),
    db: Session = Depends(get_db)
):
    evaluation = db.query(models.Evaluation).filter(models.Evaluation.id == evaluation_id).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    if evaluation.status != "pending_intern":
        raise HTTPException(status_code=400, detail="Invalid workflow state")

    evaluation.intern_comment = comment
    evaluation.status = "pending_hr"

    db.commit()

    return {"message": "Intern feedback submitted"}
@app.post("/submit-hr-review")
def submit_hr_review(
    evaluation_id: int,
    comment: str,
    rating_adjustment: int,
    user: dict = Depends(require_role("hr")),
    db: Session = Depends(get_db)
):

    # ✅ VALIDATION HERE
    if rating_adjustment < -2 or rating_adjustment > 2:
        raise HTTPException(
            status_code=400,
            detail="Adjustment must be between -2 and 2"
        )

    evaluation = db.query(models.Evaluation).filter(
        models.Evaluation.id == evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    if evaluation.status != "pending_hr":
        raise HTTPException(status_code=400, detail="Invalid workflow state")

    evaluation.hr_comment = comment
    evaluation.hr_rating_adjustment = rating_adjustment
    evaluation.status = "completed"

    # ✅ AUTO GENERATE AI REPORT ON COMPLETION
    try:
        report = generate_evaluation_report(evaluation)
        evaluation.report = report
    except Exception as e:
        print(f"AI Report Generation failed: {e}")

    db.commit()

    return {"message": "HR review completed and AI report generated"}
@app.post("/generate-report/{evaluation_id}")
def generate_report(
    evaluation_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evaluation = db.query(models.Evaluation).filter(
        models.Evaluation.id == evaluation_id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    if evaluation.status != "completed":
        raise HTTPException(status_code=400, detail="Evaluation not completed yet")

    # ✅ If report already exists, return it
    if evaluation.report:
        return {"report": evaluation.report}

    # ✅ Generate new report
    report = generate_evaluation_report(evaluation)

    # ✅ Save report in DB
    evaluation.report = report
    db.commit()

    return {"report": report}
@app.get("/manager/evaluations")
def get_manager_evaluations(
    search: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(require_role("manager")),
    db: Session = Depends(get_db)
):
    query = db.query(models.Evaluation).filter(models.Evaluation.manager_id == user["email"])
    if search:
        query = query.filter(models.Evaluation.intern_id.contains(search))
    if status:
        query = query.filter(models.Evaluation.status == status)
    
    total = query.count()
    evaluations = query.offset(skip).limit(limit).all()
    return {"total": total, "evaluations": evaluations}

@app.get("/intern/evaluations")
def get_intern_evaluations(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(require_role("intern")),
    db: Session = Depends(get_db)
):
    query = db.query(models.Evaluation).filter(
        models.Evaluation.intern_id == user["email"],
        models.Evaluation.status.in_(["pending_intern", "pending_hr", "completed"])
    )
    total = query.count()
    evaluations = query.offset(skip).limit(limit).all()
    return {"total": total, "evaluations": evaluations}

@app.get("/hr/evaluations")
def get_hr_evaluations(
    search: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(require_role("hr")),
    db: Session = Depends(get_db)
):
    query = db.query(models.Evaluation)
    
    if status:
        query = query.filter(models.Evaluation.status == status)
    else:
        # Default view for HR: pending items or historical completed items
        query = query.filter(models.Evaluation.status.in_(["pending_hr", "completed"]))

    if search:
        query = query.filter(
            (models.Evaluation.intern_id.contains(search)) | 
            (models.Evaluation.manager_id.contains(search))
        )

    total = query.count()
    evaluations = query.offset(skip).limit(limit).all()
    return {"total": total, "evaluations": evaluations}

@app.get("/hr/users")
def get_all_users(
    user: dict = Depends(require_role("hr")),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

@app.post("/hr/toggle-user")
def toggle_user(
    email: str,
    user: dict = Depends(require_role("hr")),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.email == email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle status
    target_user.is_active = 0 if target_user.is_active else 1
    db.commit()
    return {"message": f"User status updated to {'active' if target_user.is_active else 'inactive'}"}

