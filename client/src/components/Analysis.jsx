import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AnalysisInterface from "./AnalysisInterface";

export default function Analysis() {
  const [coordinates, setCoordinates] = useState({ lat: "12.9716", lon: "77.5946" });
  const navigate = useNavigate();

  const handleCoordinateUpdate = useCallback((lat, lon) => {
    setCoordinates({ lat: lat.toString(), lon: lon.toString() });
  }, []);

  const navigateToEvacuation = () => {
    navigate('/evacuation', { 
      state: { 
        lat: coordinates.lat, 
        lon: coordinates.lon 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Page Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Disaster Risk Analysis</h1>
              <p className="text-sm text-neutral-400 mt-1">Analyze flood risk for your location</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Interface */}
      <AnalysisInterface onCoordinateUpdate={handleCoordinateUpdate} />
      
      {/* Emergency Evacuation Planning Button */}
      <div className="bg-neutral-800 border-t border-neutral-700 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Emergency Evacuation Planning</h3>
            <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
              Based on your current location analysis, proceed to create evacuation routes with multiple agents and safety point detection.
            </p>
            <button
              onClick={navigateToEvacuation}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              Run Emergency Evacuation Planning
            </button>
            <p className="text-sm text-neutral-400 mt-3">
              Current Location: {coordinates.lat}, {coordinates.lon}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}