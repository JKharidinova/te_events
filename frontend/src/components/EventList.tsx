import React, { useState, useEffect } from "react";
import {Event, EventCreate, User} from "../models";
import {fetchEvents, createEvent, joinEvent, quitEvent, cancelEvent} from "../api";

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventCreate>({
    title: "",
    event_dt: "",
    duration: "1 day",
    location: "",
    organizer_id: 1,
  });
  const [formErrors, setFormErrors] = useState<Partial<EventCreate>>({});
  let activeUser: null | string | User = localStorage.getItem("active");
  let visibleAdmin = false
  if (activeUser) {
    activeUser = JSON.parse(activeUser)
    if (activeUser && typeof activeUser === 'object') {
      visibleAdmin = activeUser.name === "admin"
    }
  }
  let users = localStorage.getItem("users");
  if (users) {
    users = JSON.parse(users)
  }

  const getEvents = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let validationErrors: Partial<EventCreate> = {};
    if (!formData.title) validationErrors.title = "Title is required";
    if (!formData.event_dt) validationErrors.event_dt = "Email is required";
    if (!formData.duration) validationErrors.duration = "Duration is required";
    if (!formData.location) validationErrors.location = "Location is required";

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
    } else {
      setFormData({
        title: "",
        event_dt: "",
        duration: "1 day",
        location: "",
        organizer_id: 1,
      })
      setFormErrors({});
      await createEvent(formData)
      await getEvents()
    }
  }

  const getJoiners = (joiners: User[]) => {
    return (joiners.map((u) => u.name)).join(", ")
  }

  const getOrganizer = (orgID: number) => {
    if (Array.isArray(users)) {
      const organizer = users?.find((u) => u.id = orgID)
      return organizer.name
    }
    return ""
  }

  const readDt = (dt: string) => {
    const eventDt = new Date(dt)
    return eventDt.toString()
  }
  const visibleJoin = (joiners: User[]) => {
    if (activeUser && typeof activeUser === 'object') {
      // @ts-ignore: Object is possibly 'null'.
      return !joiners.find((u) => u.id === activeUser.id)
    }
    return false
  }
  const onJoin = async (event_id: number) => {
    // @ts-ignore: Object is possibly 'null'.
    await joinEvent(event_id, activeUser.id)
    await getEvents()
  }
  const onQuit = async (event_id: number) => {
    // @ts-ignore: Object is possibly 'null'.
    await quitEvent(event_id, activeUser.id)
    await getEvents()
  }
  const onCancel = async (event_id: number) => {
    await cancelEvent(event_id)
    await getEvents()
  }
  const visibleQuit = (joiners: User[]) => {
    if (activeUser && typeof activeUser === 'object') {
      // @ts-ignore: Object is possibly 'null'.
      return joiners.find((u) => u.id === activeUser.id)
    }
    return false
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
      <div style={{padding: "20px"}}>
        <header className="m-2 text-2xl font-bold text-gray-800">
          LocalEvents
        </header>
        <div className="flex">
          <ul className="m-2">
            {events.map((event) => (
                <li key={event.id} className="pt-2 grid grid-cols-2">
                  <div className="mr-2">
                    <strong>{event.title}</strong> - {readDt(event.event_dt)}
                    <div>Duration: {event.duration}</div>
                    <div>Location: {event.location}</div>
                    <div>Organizer: {getOrganizer(event.organizer_id)}</div>
                    <div>Joiners: {getJoiners(event.joiners)}</div>
                  </div>
                  <div>
                    {visibleJoin(event.joiners) &&
                    <div className="mb-2">
                      <button
                          className="bg-transparent hover:bg-gray-500 text-gray-500 text-xs hover:text-white font-semibold py-2 px-4 border border-gray-500 hover:border-transparent  rounded-md"
                          onClick={() => onJoin(event.id)}
                      >
                        Join
                      </button>
                    </div>}
                    {visibleQuit(event.joiners) &&
                    <div className="mb-2">
                      <button
                          className="bg-transparent hover:bg-gray-500 text-gray-500 text-xs hover:text-white font-semibold py-2 px-4 border border-gray-500 hover:border-transparent  rounded-md"
                          onClick={() => onQuit(event.id)}
                      >
                        Quit
                      </button>
                    </div>}
                    {visibleAdmin &&
                    <div className="mb-2">
                      <button
                          className="bg-transparent hover:bg-gray-500 text-gray-500 text-xs hover:text-white font-semibold py-2 px-4 border border-gray-500 hover:border-transparent  rounded-md"
                          onClick={() => onCancel(event.id)}
                      >
                        Cancel
                      </button>
                    </div>}
                  </div>
                </li>
            ))}
          </ul>
          <div className="m-2 pt-2">
            <div className="w-full max-w-xs">
              {visibleAdmin &&
              <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="event_dt">
                    Date and Time
                  </label>
                  <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="datetime-local"
                      id="event_dt"
                      name="event_dt"
                      value={formData.event_dt}
                      onChange={handleChange}
                      required
                  />
                  {formErrors.event_dt && <p className="text-red-500 text-sm mt-1">{formErrors.event_dt}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                    Duration
                  </label>
                  <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                  />
                  {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                    Location
                  </label>
                  <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                  />
                  {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <button
                      type="submit"
                      className="bg-transparent hover:bg-gray-500 text-gray-500 text-xs hover:text-white font-semibold py-2 px-4 border border-gray-500 hover:border-transparent  rounded-md">
                    Add
                  </button>
                </div>
              </form>}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EventList;