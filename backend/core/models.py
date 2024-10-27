from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class UserEventLink(SQLModel, table=True):
    user_id: int | None = Field(default=None, foreign_key="user.id", primary_key=True)
    event_id: int | None = Field(default=None, foreign_key="event.id", primary_key=True)


class UserBase(SQLModel):
    name: str = Field(index=True)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    events: list["Event"] = Relationship(back_populates="joiners", link_model=UserEventLink)


class UserPublic(UserBase):
    id: int


class UserCreate(UserBase):
    pass


class EventBase(SQLModel):
    title: str
    event_dt: datetime = Field(default=None)
    duration: str
    location: str
    organizer_id: int | None = Field(default=None)


class Event(EventBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    joiners: list["User"] = Relationship(back_populates="events", link_model=UserEventLink)


class EventPublic(EventBase):
    id: int
    joiners: Optional[list["UserPublic"]]


class EventCreate(EventBase):
    pass


class M2Mrelation(SQLModel):
    event_id: int
    user_id: int
