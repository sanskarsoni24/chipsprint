import boto3
from .config import settings

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_KEY,
        region_name=settings.AWS_REGION,
    )

def upload_fileobj_to_s3(fileobj, key):
    s3 = get_s3()
    s3.upload_fileobj(fileobj, settings.AWS_S3_BUCKET, key)

def generate_presigned_url(key, expires=3600):
    s3 = get_s3()
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_S3_BUCKET, "Key": key},
        ExpiresIn=expires,
    )
    return url