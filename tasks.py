import os
import zipfile
from celery import Celery
from sqlalchemy.orm import Session
from .config import settings
from . import models, predictor, s3_utils, database
import tempfile
import shutil

celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

@celery_app.task
def process_job(job_id: int):
    db: Session = database.SessionLocal()
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        return
    job.status = models.JobStatus.RUNNING
    db.commit()
    try:
        # Download zip from S3
        s3 = s3_utils.get_s3()
        zip_path = tempfile.mktemp(suffix=".zip")
        with open(zip_path, "wb") as f:
            s3.download_fileobj(settings.AWS_S3_BUCKET, job.zip_s3_key, f)
        with tempfile.TemporaryDirectory() as tmpdir:
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(tmpdir)
            def_path = os.path.join(tmpdir, "design.def")
            rpt_path = os.path.join(tmpdir, "timing.rpt")
            out_json = os.path.join(tmpdir, "violations.json")
            out_tcl = os.path.join(tmpdir, "fix.tcl")
            predictor.run_predictor(def_path, rpt_path, out_json, out_tcl)
            # Upload results to S3
            violations_key = f"results/{job_id}/violations.json"
            fix_key = f"results/{job_id}/fix.tcl"
            with open(out_json, "rb") as f:
                s3.upload_fileobj(f, settings.AWS_S3_BUCKET, violations_key)
            with open(out_tcl, "rb") as f:
                s3.upload_fileobj(f, settings.AWS_S3_BUCKET, fix_key)
            job.violations_s3_key = violations_key
            job.fix_s3_key = fix_key
            job.status = models.JobStatus.DONE
            db.commit()
        # Slack webhook (stretch)
        if settings.SLACK_WEBHOOK_URL:
            import requests
            requests.post(settings.SLACK_WEBHOOK_URL, json={"text": f"Job {job_id} completed!"})
    except Exception as e:
        job.status = models.JobStatus.ERROR
        job.error_msg = str(e)
        db.commit()
        raise
    finally:
        db.close()