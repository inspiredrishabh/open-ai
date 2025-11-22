import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Circle,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ lat = 12.9716, lon = 77.5946, analysis }) {
  const safeZones = (analysis && analysis.safeZones) || [];
  const risk = analysis?.floodProbability ?? 0;

  const getRiskColor = (risk) => {
    if (risk > 70) return { color: "red", fillColor: "rgba(255,0,0,0.35)" };
    if (risk > 40)
      return { color: "orange", fillColor: "rgba(255,165,0,0.25)" };
    return { color: "green", fillColor: "rgba(0,128,0,0.15)" };
  };

  const riskStyle = getRiskColor(risk);
  const route = safeZones[0]
    ? [
        [lat, lon],
        [safeZones[0].lat, safeZones[0].lon],
      ]
    : null;

  return (
    <div className="h-full w-full relative bg-gray-800">
      {!analysis && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Interactive Map
            </h3>
            <p className="text-gray-400">
              🔸 Click anywhere on the map to analyze that location
            </p>
          </div>
        </div>
      )}

      <MapContainer
        center={[lat, lon]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[lat, lon]} />

        {analysis && (
          <Circle
            center={[lat, lon]}
            radius={Math.max(500, risk * 20)}
            pathOptions={riskStyle}
          />
        )}

        {safeZones.map((zone, idx) => (
          <Marker key={idx} position={[zone.lat, zone.lon]} />
        ))}

        {route && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "blue",
              weight: 3,
              dashArray: "10, 5",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
