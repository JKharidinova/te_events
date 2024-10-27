from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Query
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import select

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


@app.post("/users/", response_model=UserPublic)
def create_user(user: UserCreate, session: SessionDep):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.get("/users/", response_model=list[UserPublic])
def read_users(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@app.get("/events/", response_model=list[EventPublic])
def read_events(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    events = session.exec(select(Event).offset(offset).limit(limit)).all()
    return events


@app.post("/events/", response_model=EventPublic)
def create_event(event: EventCreate, session: SessionDep):
    db_event = Event.model_validate(event)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event


@app.post("/event/join/", response_model=EventPublic)
def join_event(params: M2Mrelation, session: SessionDep):
    event = session.get(Event, params.event_id)
    user = session.get(User, params.user_id)
    event.joiners.append(user)
    session.add(event)
    session.commit()
    return event


@app.post("/event/quit/", response_model=EventPublic)
def quit_event(params: M2Mrelation, session: SessionDep):
    event = session.get(Event, params.event_id)
    user = session.get(User, params.user_id)
    user.events.remove(event)
    session.add(event)
    session.commit()
    return event


@app.delete("/event/cancel/{event_id}", response_model=dict)
def cancel_event(event_id: int, session: SessionDep):
    event = session.get(Event, event_id)
    session.delete(event)
    session.commit()

    return {"detail": f"Event with ID {event_id} has been deleted"}
