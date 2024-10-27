export interface User {
  id: number;
  name: string;
}

export interface Event {
  id: number;
  title: string;
  event_dt: string;
  duration: string;
  location: string;
  organizer_id: number;
  joiners: User[]
}

export interface EventCreate {
  title: string;
  event_dt: string;
  duration: string;
  location: string;
  organizer_id: number;
}
