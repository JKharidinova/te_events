import {Event, EventCreate, User} from "./models";

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch("http://127.0.0.1:8000/events/");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("http://127.0.0.1:8000/users/");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

export const createEvent = async (event: EventCreate): Promise<Event> => {
  const response = await fetch("http://127.0.0.1:8000/events/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event)
  });
  if (!response.ok) {
    throw new Error("Failed to createEvent");
  }
  return response.json();
};

export const joinEvent = async (event_id: number, user_id: number): Promise<Event> => {
  const response = await fetch("http://127.0.0.1:8000/event/join/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({event_id: event_id, user_id: user_id})
  });
  if (!response.ok) {
    throw new Error("Failed to fetch joinEvent");
  }
  return response.json();
};

export const quitEvent = async (event_id: number, user_id: number): Promise<Event> => {
  const response = await fetch("http://127.0.0.1:8000/event/quit/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({event_id: event_id, user_id: user_id})
  });
  if (!response.ok) {
    throw new Error("Failed to fetch quitEvent");
  }
  return response.json();
};

export const cancelEvent = async (event_id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/event/cancel/${event_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch quitEvent");
  }
};
