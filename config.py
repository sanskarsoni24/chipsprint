import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/chipsprint")
    AWS_ACCESS_KEY: str = os.getenv("AWS_ACCESS_KEY", "minioadmin")
    AWS_SECRET_KEY: str = os.getenv("AWS_SECRET_KEY", "minioadmin")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "chipsprint-bucket")
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "http://minio:9000")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
    SLACK_WEBHOOK_URL: str = os.getenv("SLACK_WEBHOOK_URL", "")

settings = Settings()