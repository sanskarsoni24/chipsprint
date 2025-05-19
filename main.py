from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth, deps, s3_utils, tasks, config, database
import uuid

app = FastAPI(title="ChipSprint Backend")

origins = ["*"]  # For local dev; restrict for prod!
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

models.Base.metadata.create_all(bind=database.engine)

# Auth endpoints
@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: auth.OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": token, "token_type": "bearer"}

# Upload endpoint
@app.post("/upload")
def upload_design(
    file: UploadFile = File(...), db: Session = Depends(auth.get_db), user: models.User = Depends(auth.get_current_active_user)
):
    # Accept ZIP, verify contents
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Must upload a .zip file")
    key = f"uploads/{uuid.uuid4()}.zip"
    s3_utils.upload_fileobj_to_s3(file.file, key)
    job = models.Job(owner_id=user.id, zip_s3_key=key)
    db.add(job)
    db.commit()
    db.refresh(job)
    # Launch background job
    tasks.process_job.delay(job.id)
    return {"job_id": job.id}

# Job status endpoint
@app.get("/job/{job_id}", response_model=schemas.JobStatusResp)
def job_status(job_id: int, db: Session = Depends(auth.get_db), user: models.User = Depends(auth.get_current_active_user)):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.owner_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    violations_url = fix_url = None
    if job.status == models.JobStatus.DONE:
        violations_url = s3_utils.generate_presigned_url(job.violations_s3_key)
        fix_url = s3_utils.generate_presigned_url(job.fix_s3_key)
    return schemas.JobStatusResp(
        status=job.status,
        violations_url=violations_url,
        fix_url=fix_url,
        error_msg=job.error_msg,
    )