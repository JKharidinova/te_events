import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {fetchUsers} from "../api";
import {User} from "../models";

const Index: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        if (data.length > 0) {
          localStorage.setItem("active", JSON.stringify(data[0]));
          localStorage.setItem("users", JSON.stringify(data));
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    getUsers();
  }, []);

  const handleEnter = () => {
    navigate("/events");
  };

  const setActive = (userID: number) => {
    const user = users.find((u) => u.id === userID)
    localStorage.setItem("active", JSON.stringify(user));
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <header className="absolute top-8 text-2xl font-bold text-gray-800">
          Welcome to the LocalEvents
        </header>
        <div className="w-full flex items-center justify-center">
          <select className="m-2 p-2 border rounded-md text-gray-700" onChange={(e)=>setActive(Number(e.target.value))}>
            {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <button className="bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-2 px-4 rounded" onClick={handleEnter}>
            Enter
          </button>
        </div>
      </div>
  );
};

export default Index;
