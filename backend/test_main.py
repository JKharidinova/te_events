import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from core.db import get_session
from main import app

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, echo=True)


def get_test_session():
    with Session(engine) as session:
        yield session


# noinspection PyUnresolvedReferences
app.dependency_overrides[get_session] = get_test_session


@pytest.fixture(name="client")
def client_fixture():
    SQLModel.metadata.create_all(engine)
    with TestClient(app) as client:
        yield client
    SQLModel.metadata.drop_all(engine)


def test_create_event(client):
    response = client.post("/event/", json={
        "title": "Test event",
        "event_dt": "2024-10-30T10:00",
        "duration": "1 day",
        "location": "Test Location",
        "organizer_id": 1,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test event"
    assert data["location"] == "Test Location"
    assert "id" in data


def test_get_event(client):
    response = client.post("/event/", json={
        "title": "Test event",
        "event_dt": "2024-10-30T10:00",
        "duration": "1 day",
        "location": "Test Location",
        "organizer_id": 1,
    })
    event_id = response.json()["id"]

    response = client.get(f"/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == event_id
