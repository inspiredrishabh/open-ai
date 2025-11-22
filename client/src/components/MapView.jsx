import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function MapView({ lat = 12.9716, lon = 77.5946, analysis }) {
  const safeZones = (analysis && analysis.safeZones) || [];
  const risk = analysis?.floodProbability ?? 0;
  const riskColor = risk > 70 ? "rgba(255,0,0,0.35)" : risk > 40 ? "rgba(255,165,0,0.25)" : "rgba(0,128,0,0.15)";
  const route = (safeZones[0]) ? [[lat, lon], [safeZones[0].lat, safeZones[0].lon]] : null;

  return (
    <div className="h-full w-full min-h-[500px]">
      <MapContainer center={[lat, lon]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lon]} />
        {analysis && (
          <Circle center={[lat, lon]} radius={Math.max(200, risk * 10)} pathOptions={{ color: risk > 70 ? "red" : risk > 40 ? "orange" : "green", fillColor: riskColor }} />
        )}
        {safeZones.map((z, idx) => <Marker key={idx} position={[z.lat, z.lon]} />)}
        {route && <Polyline positions={route} dashArray="8" />}
      </MapContainer>
    </div>
  );
}
