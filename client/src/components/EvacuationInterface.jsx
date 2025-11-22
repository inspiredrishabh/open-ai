import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const agentColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const EvacuationInterface = () => {
  const [mapCenter] = useState([28.6139, 77.2090]); // Delhi coordinates
  const [agents, setAgents] = useState([]);
  const [paths, setPaths] = useState([]);
  const [agentPlacementMode, setAgentPlacementMode] = useState(false);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Custom marker icons for start/end points
  const createCustomIcon = (color, label) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-weight: bold; color: white;">${label}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Map click handler component - MUST be inside MapContainer
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (!agentPlacementMode) return;

        const clickedPoint = [e.latlng.lat, e.latlng.lng];

        if (!pendingAgent) {
          // Start new agent
          const newAgent = {
            id: Date.now(),
            name: `Agent ${agents.length + 1}`,
            start: clickedPoint,
            end: null,
            color: agentColors[agents.length % agentColors.length],
          };
          setPendingAgent(newAgent);
        } else if (!pendingAgent.end) {
          // Complete the agent
          const completedAgent = { ...pendingAgent, end: clickedPoint };
          setAgents((prev) => [...prev, completedAgent]);
          setPendingAgent(null);
          setAgentPlacementMode(false);
        }
      },
    });

    return null; // This component doesn't render anything
  };

  // Get real road-based routes using OSRM (Open Source Routing Machine)
  const getRoadRoute = async (start, end) => {
    try {
      // Using OSRM public API (more reliable and free)
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      
      if (response.data.code === 'Ok' && response.data.routes && response.data.routes[0]) {
        const route = response.data.routes[0];
        // OSRM returns coordinates in [lon, lat] format, we need [lat, lon]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const distance = (route.distance / 1000).toFixed(2);
        const duration = Math.round(route.duration / 60);
        
        return { coordinates, distance, duration, blocked: false, impossible: false };
      }
    } catch (error) {
      console.warn('OSRM failed, trying alternative...', error.message);
      
      // Try OpenRouteService as backup
      try {
        const response = await axios.post(
          'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
          {
            coordinates: [[start[1], start[0]], [end[1], end[0]]]
          },
          {
            headers: {
              'Authorization': '5b3ce3597851110001cf6248ddeae75119fa4c62b25a72c0fd5068a9',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.features && response.data.features[0]) {
          const route = response.data.features[0];
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const distance = (route.properties.segments[0].distance / 1000).toFixed(2);
          const duration = Math.round(route.properties.segments[0].duration / 60);
          
          return { coordinates, distance, duration, blocked: false, impossible: false };
        }
      } catch (orsError) {
        console.warn('OpenRouteService also failed:', orsError.message);
      }
    }
    
    // Fallback to straight line only if all APIs fail
    const distance = calculateDistance(start, end);
    return {
      coordinates: [start, end],
      distance: distance.toFixed(2),
      duration: Math.round(distance * 12),
      blocked: false,
      impossible: false,
    };
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (point1, point2) => {
    const R = 6371;
    const dLat = ((point2[0] - point1[0]) * Math.PI) / 180;
    const dLon = ((point2[1] - point1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1[0] * Math.PI) / 180) *
        Math.cos((point2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toggleAgentPlacementMode = () => {
    setAgentPlacementMode(!agentPlacementMode);
    setPendingAgent(null);
  };

  const clearAll = () => {
    setAgents([]);
    setPaths([]);
    setPendingAgent(null);
  };

  // Real road-based pathfinding simulation
  const runSimulation = async () => {
    if (agents.length === 0) {
      alert('Please add at least one agent');
      return;
    }

    const invalidAgents = agents.filter(a => !a.start || !a.end);
    if (invalidAgents.length > 0) {
      alert('Please set start and end points for all agents');
      return;
    }

    setIsRunning(true);
    const newPaths = [];

    for (const agent of agents) {
      const routeData = await getRoadRoute(agent.start, agent.end);
      newPaths.push({
        id: agent.id,
        ...routeData,
        color: agent.color,
      });
    }

    setPaths(newPaths);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-neutral-700">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🚨 Emergency Evacuation Planning
          </h1>
          <p className="text-neutral-400 mt-2">
            Plan optimal evacuation routes with real road routing and multi-agent coordination
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-600">
              {agentPlacementMode && pendingAgent && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white text-sm font-medium">
                  🎯 {pendingAgent.start ? 'Click on map to set END point' : 'Click on map to set START point'}
                </div>
              )}
              
              <div style={{ height: '600px', position: 'relative' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {/* Map click handler - must be inside MapContainer */}
                  <MapClickHandler />

                  {/* Render pending agent */}
                  {pendingAgent && pendingAgent.start && (
                    <Marker
                      position={pendingAgent.start}
                      icon={createCustomIcon(pendingAgent.color, 'S')}
                    >
                      <Popup>{pendingAgent.name} - Start</Popup>
                    </Marker>
                  )}

                  {/* Render completed agents */}
                  {agents.map((agent) => (
                    <div key={agent.id}>
                      {agent.start && (
                        <Marker
                          position={agent.start}
                          icon={createCustomIcon(agent.color, 'S')}
                        >
                          <Popup>{agent.name} - Start</Popup>
                        </Marker>
                      )}
                      {agent.end && (
                        <Marker
                          position={agent.end}
                          icon={createCustomIcon(agent.color, 'E')}
                        >
                          <Popup>{agent.name} - End</Popup>
                        </Marker>
                      )}
                    </div>
                  ))}

                  {/* Render paths */}
                  {paths.map((path) => (
                    <Polyline
                      key={path.id}
                      positions={path.coordinates}
                      color={path.color}
                      weight={4}
                      opacity={0.7}
                      dashArray={path.blocked ? '10, 10' : null}
                    />
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-4">
            {/* Quick Actions Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-600">
              <h3 className="text-lg font-bold text-white mb-4">🎮 Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={toggleAgentPlacementMode}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-all ${
                    agentPlacementMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {agentPlacementMode ? '✓ Agent Placement Active' : '+ Quick Add Agent'}
                </button>

                <button
                  onClick={runSimulation}
                  disabled={agents.length === 0 || isRunning}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  {isRunning ? '⏳ Running...' : '▶️ Run Simulation'}
                </button>

                <button
                  onClick={clearAll}
                  disabled={agents.length === 0}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-md hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            {/* Route Results Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-600">
              <h3 className="text-lg font-bold text-white mb-4">📊 Route Results</h3>
              <div className="space-y-3">
                {paths.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-neutral-400 text-sm">No routes calculated yet</p>
                    <p className="text-neutral-500 text-xs mt-1">Add agents and run simulation</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {paths.map(path => {
                      const agent = agents.find(a => a.id === path.id);
                      return (
                        <div
                          key={path.id}
                          className="bg-neutral-800 rounded-md p-3 border-l-4"
                          style={{ borderColor: path.color }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{agent?.name || 'Agent'}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              path.impossible ? 'bg-red-500/20 text-red-400' : 
                              path.blocked ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {path.impossible ? '❌ Impossible' : path.blocked ? '⚠️ Blocked' : '✅ Clear'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-neutral-400">Distance:</div>
                            <div className="text-white font-medium">{path.distance} km</div>
                            <div className="text-neutral-400">Duration:</div>
                            <div className="text-white font-medium">{path.duration} min</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Agents List Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-600">
              <h3 className="text-lg font-bold text-white mb-4">👥 Agents ({agents.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {agents.map(agent => (
                  <div 
                    key={agent.id}
                    className="bg-neutral-800 rounded-md p-3 border-l-4"
                    style={{ borderColor: agent.color }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{agent.name}</span>
                      <button
                        onClick={() => setAgents(prev => prev.filter(a => a.id !== agent.id))}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        agent.start ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-neutral-500'
                      }`}>
                        {agent.start ? '✓ Start' : '○ Start'}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        agent.end ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-700 text-neutral-500'
                      }`}>
                        {agent.end ? '✓ End' : '○ End'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvacuationInterface;
