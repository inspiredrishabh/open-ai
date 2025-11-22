import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      {/* Navigation header */}
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">SafeGuard AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Disaster Risk Analysis</span>
              <Link 
                to="/"
                className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

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