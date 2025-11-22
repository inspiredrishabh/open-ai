import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Analysis from "./components/Analysis";
import Evacuation from "./components/Evacuation";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/analyze" element={<Analysis />} />
      <Route path="/evacuation" element={<Evacuation />} />
    </Routes>
  );
}
