# ChipSprint MVP

Cloud-native AI copilot for chip physical design: predicts layout violations, auto-generates ECO TCL.

## Features

- Secure upload: DEF + timing.rpt ZIP → S3, job queued
- Async job runner (Celery) with dummy ML violation predictor
- REST API: job status, signed result URLs
- React dashboard: upload, heatmap, download ECO
- Auth (JWT): email/password, roles
- Unit tests, Docker-compose, and Terraform infra

## Local Setup

```bash
git clone https://github.com/yourorg/chipsprint.git
cd chipsprint
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Example ZIP

See `sample_upload.zip` for format:
```
design.def
timing.rpt
```

## API Examples

**Register**
```bash
curl -X POST http://localhost:8000/auth/register -H "Content-Type: application/json" -d '{"email":"test@me.com","password":"pw123"}'
```

**Login**
```bash
curl -X POST http://localhost:8000/auth/login -d 'username=test@me.com&password=pw123'
```

**Upload Design**
```bash
curl -X POST http://localhost:8000/upload -H "Authorization: Bearer <TOKEN>" -F file=@sample_upload.zip
```

**Get Job Status**
```bash
curl -X GET http://localhost:8000/job/<JOB_ID> -H "Authorization: Bearer <TOKEN>"
```

## Deployment

- Build & push Docker images to ECR (`backend`, `frontend`)
- `cd terraform && terraform apply` to create VPC, ECS, RDS, S3, and outputs public URL

---
