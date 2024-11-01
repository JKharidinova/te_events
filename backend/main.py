import json
from contextlib import asynccontextmanager
from typing import Annotated, List

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import select, SQLModel

from core.db import create_db_and_tables, SessionDep
from core.models import (
    User,
    UserCreate,
    UserPublic,
    Event,
    EventCreate,
    EventPublic,
    M2Mrelation
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

origins = [
    "http://localhost:3000",
    "http://localhost",
]

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
clients: List[WebSocket] = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.append(websocket)


async def broadcast_event_update(event_data: dict | Event, action: str):
    if isinstance(event_data, SQLModel):
        event_data = {
            "id": event_data.id,
            "title": event_data.title,
            "event_dt": event_data.event_dt.isoformat(),
            "duration": event_data.duration,
            "location": event_data.location,
            "organizer_id": event_data.organizer_id,
            "joiners": [
                {"id": user.id, "name": user.name} for user in event_data.joiners
            ] if event_data.joiners else []
        }
    message = {"action": action, "data": event_data}
    for client in clients:
        await client.send_json(message)


@app.post("/users/", response_model=UserPublic)
async def create_user(user: UserCreate, session: SessionDep):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.get("/users/", response_model=list[UserPublic])
async def read_users(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@app.get("/events/", response_model=list[EventPublic])
async def read_events(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    events = session.exec(select(Event).offset(offset).limit(limit)).all()
    return events


@app.post("/events/", response_model=EventPublic)
async def create_event(event: EventCreate, session: SessionDep):
    db_event = Event.model_validate(event)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    await broadcast_event_update(db_event, "create")
    return db_event


@app.post("/event/join/", response_model=EventPublic)
async def join_event(params: M2Mrelation, session: SessionDep):
    event = session.get(Event, params.event_id)
    user = session.get(User, params.user_id)
    event.joiners.append(user)
    session.add(event)
    session.commit()
    await broadcast_event_update(event, "update")
    return event


@app.post("/event/quit/", response_model=EventPublic)
async def quit_event(params: M2Mrelation, session: SessionDep):
    event = session.get(Event, params.event_id)
    user = session.get(User, params.user_id)
    user.events.remove(event)
    session.add(event)
    session.commit()
    await broadcast_event_update(event, "update")
    return event


@app.delete("/event/cancel/{event_id}", response_model=dict)
async def cancel_event(event_id: int, session: SessionDep):
    event = session.get(Event, event_id)
    session.delete(event)
    session.commit()
    await broadcast_event_update({"event_id": event_id}, "delete")
    return {"detail": f"Event with ID {event_id} has been deleted"}
