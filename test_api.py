from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    email = "testuser@example.com"
    password = "testpass"
    # Register
    resp = client.post("/auth/register", json={"email": email, "password": password})
    assert resp.status_code == 200
    # Login
    resp = client.post("/auth/login", data={"username": email, "password": password})
    assert resp.status_code == 200
    assert "access_token" in resp.json()