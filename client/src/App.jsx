import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Analysis from "./components/Analysis";
import Evacuation from "./components/Evacuation";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analysis />} />
        <Route path="/evacuation" element={<Evacuation />} />
      </Routes>
    </div>
  );
}
