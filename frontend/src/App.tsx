import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./components/Index";
import EventList from "./components/EventList";
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events" element={<EventList />} />
      </Routes>
    </Router>
  );
}

export default App;
