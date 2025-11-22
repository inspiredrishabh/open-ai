import React from "react";
import { Link, useLocation } from "react-router-dom";
import EvacuationInterface from "./EvacuationInterface";

export default function Evacuation() {
  const location = useLocation();
  const { lat = "28.6139", lon = "77.2090" } = location.state || {};

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
              <span className="text-sm text-neutral-400">Emergency Evacuation Planning</span>
              <Link 
                to="/analyze"
                className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Evacuation Interface with coordinates from previous page */}
      <EvacuationInterface initialLat={parseFloat(lat)} initialLon={parseFloat(lon)} />
    </div>
  );
}