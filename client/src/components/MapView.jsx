import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapUpdater({ lat, lon }) {
  const map = useMapEvents({});
  
  React.useEffect(() => {
    if (lat && lon) {
      // Pan to new coordinates with smooth animation
      map.setView([lat, lon], map.getZoom(), {
        animate: true,
        pan: {
          animate: true,
          duration: 1
        }
      });
    }
  }, [lat, lon, map]);
  
  return null;
}

export default function MapView({ 
  lat = 12.9716, 
  lon = 77.5946, 
  analysis, 
  onMapClick,
  evacuationPoints = [],
  roadBlocks = [],
  evacuationRoutes = []
}) {
  const safeZones = (analysis && analysis.safeZones) || [];
  const risk = analysis?.floodProbability ?? 0;
  const riskColor = risk > 70 ? "rgba(220, 38, 38, 0.3)" : risk > 40 ? "rgba(249, 115, 22, 0.25)" : "rgba(22, 163, 74, 0.2)";
  const strokeColor = risk > 70 ? "#dc2626" : risk > 40 ? "#f97316" : "#16a34a";

  // Create custom icons
  const safeZoneIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.8"/>
        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const roadBlockIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.8"/>
        <path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="h-full w-full relative bg-neutral-100 dark:bg-neutral-800">
      {!analysis && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm z-10 pointer-events-none" style={{zIndex: 10}}>
          <div className="text-center px-6">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-700">
              <svg className="w-10 h-10 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 font-medium text-sm">Click anywhere on the map to analyze location</p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">Get flood risk assessment and evacuation routes</p>
          </div>
        </div>
      )}
      
      <MapContainer 
        center={[lat, lon]} 
        zoom={13} 
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
        zoomControl={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        <MapUpdater lat={lat} lon={lon} />
        
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="text-sm">
              <strong className="text-neutral-900">Analysis Location</strong><br />
              <span className="text-neutral-600">Lat: {lat.toFixed(4)}</span><br />
              <span className="text-neutral-600">Lon: {lon.toFixed(4)}</span>
            </div>
          </Popup>
        </Marker>
        
        {analysis && (
          <Circle 
            center={[lat, lon]} 
            radius={Math.max(500, risk * 20)} 
            pathOptions={{ 
              color: strokeColor, 
              fillColor: riskColor,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.4
            }} 
          />
        )}

        {/* Evacuation Points */}
        {evacuationPoints.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lon]} icon={safeZoneIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-green-700">{point.label}</strong><br />
                <span className="text-neutral-600">Safe Evacuation Zone</span><br />
                <span className="text-xs text-neutral-500">{point.lat.toFixed(4)}, {point.lon.toFixed(4)}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Road Blocks */}
        {roadBlocks.map((block) => (
          <Marker key={block.id} position={[block.lat, block.lon]} icon={roadBlockIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-red-700">{block.label}</strong><br />
                <span className="text-neutral-600">Road Blocked</span><br />
                <span className="text-xs text-neutral-500">{block.lat.toFixed(4)}, {block.lon.toFixed(4)}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Evacuation Routes */}
        {evacuationRoutes.map((route, index) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: route.blocked ? '#ef4444' : '#22c55e',
              weight: 4,
              opacity: 0.8,
              dashArray: route.blocked ? '10, 10' : null
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong className={route.blocked ? 'text-red-700' : 'text-green-700'}>
                  Route {index + 1} - {route.status.toUpperCase()}
                </strong><br />
                <span className="text-neutral-600">To: {route.destination}</span><br />
                <span className="text-neutral-600">Distance: {route.distance}</span><br />
                <span className="text-neutral-600">Duration: {route.duration}</span>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
}
