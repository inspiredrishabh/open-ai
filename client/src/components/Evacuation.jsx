import React from "react";
import { useLocation } from "react-router-dom";
import EvacuationInterface from "./EvacuationInterface";

export default function Evacuation() {
  const location = useLocation();
  const { lat = "28.6139", lon = "77.2090" } = location.state || {};

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Page Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚨</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Emergency Evacuation Planning</h1>
              <p className="text-sm text-neutral-400 mt-1">Plan optimal evacuation routes with real-time coordination</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evacuation Interface with coordinates from previous page */}
      <EvacuationInterface initialLat={parseFloat(lat)} initialLon={parseFloat(lon)} />
    </div>
  );
}