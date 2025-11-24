import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle, useMapEvents } from 'react-leaflet';
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
  const [roadBlocks, setRoadBlocks] = useState([]);
  const [blockPlacementMode, setBlockPlacementMode] = useState(false);

  // Custom marker icons for start/end points
  const createCustomIcon = (color, label) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-weight: bold; color: white;">${label}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const createBlockIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #ef4444; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5); font-size: 18px;">🚫</div>`,
      iconSize: [35, 35],
      iconAnchor: [17.5, 17.5],
    });
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const clickedPoint = [e.latlng.lat, e.latlng.lng];

        // Handle road block placement
        if (blockPlacementMode) {
          const newBlock = {
            id: Date.now(),
            position: clickedPoint,
            radius: 1.0 // Increased to 1km radius for better coverage
          };
          setRoadBlocks(prev => [...prev, newBlock]);
          setBlockPlacementMode(false);
          
          // Recalculate routes if simulation was already run
          if (paths.length > 0) {
            setTimeout(() => recalculateRoutes(), 100);
          }
          return;
        }

        // Handle agent placement
        if (!agentPlacementMode) return;

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

    return null;
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

  // Check if a point is near any road block
  const isPointBlocked = (point) => {
    return roadBlocks.some(block => {
      const distance = calculateDistance(point, block.position);
      return distance <= block.radius;
    });
  };

  // Check if a route passes through any blocked area
  const isRouteBlocked = (coordinates) => {
    // Sample more points along the route for better accuracy
    const sampleInterval = Math.max(1, Math.floor(coordinates.length / 50)); // Sample at least 50 points
    
    for (let i = 0; i < coordinates.length; i += sampleInterval) {
      if (isPointBlocked(coordinates[i])) {
        return true;
      }
    }
    
    // Always check the last point
    if (coordinates.length > 0 && !isPointBlocked(coordinates[coordinates.length - 1])) {
      // Also check final point
    } else if (coordinates.length > 0) {
      return true;
    }
    
    return false;
  };

  // Get real road-based routes using OSRM with alternative route finding
  const getRoadRoute = async (start, end, findAlternative = false) => {
    try {
      // Request alternative routes from OSRM
      const alternatives = findAlternative ? 'true' : 'false';
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&alternatives=${alternatives}&steps=true`
      );
      
      if (response.data.code === 'Ok' && response.data.routes && response.data.routes.length > 0) {
        const routes = response.data.routes;
        const processedRoutes = [];
        
        // Process all available routes
        for (const route of routes) {
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const distance = (route.distance / 1000).toFixed(2);
          const duration = Math.round(route.duration / 60);
          const blocked = isRouteBlocked(coordinates);
          
          processedRoutes.push({
            coordinates,
            distance,
            duration,
            blocked,
            impossible: false
          });
        }
        
        // If looking for alternatives and primary route is blocked
        if (findAlternative && processedRoutes[0]?.blocked) {
          // Find first non-blocked route
          const clearRoute = processedRoutes.find(r => !r.blocked);
          if (clearRoute) {
            return {
              primary: processedRoutes[0],
              alternative: clearRoute,
              hasAlternative: true
            };
          }
          
          // If no clear route in alternatives, try detouring around blocks
          const detourRoute = await findDetourRoute(start, end);
          if (detourRoute && !detourRoute.blocked) {
            return {
              primary: processedRoutes[0],
              alternative: detourRoute,
              hasAlternative: true
            };
          }
        }
        
        // Return primary route (may be blocked)
        return processedRoutes[0];
      }
    } catch (error) {
      console.warn('OSRM failed, trying alternative...', error.message);
    }
    
    // Fallback
    const distance = calculateDistance(start, end);
    return {
      coordinates: [start, end],
      distance: distance.toFixed(2),
      duration: Math.round(distance * 12),
      blocked: false,
      impossible: false,
    };
  };

  // Find detour route by adding waypoints around blocked areas
  const findDetourRoute = async (start, end) => {
    try {
      // Calculate midpoint and create offset waypoints to avoid blocked areas
      const midLat = (start[0] + end[0]) / 2;
      const midLon = (start[1] + end[1]) / 2;
      
      // Calculate distance to determine appropriate offset range
      const totalDistance = calculateDistance(start, end);
      const baseOffset = Math.max(0.05, totalDistance * 0.15); // At least 5km or 15% of total distance
      
      // Try different offset angles and distances to find clear path
      const offsets = [
        // Close range offsets (15% of distance)
        { lat: baseOffset, lon: baseOffset },           // Northeast
        { lat: baseOffset, lon: -baseOffset },          // Northwest
        { lat: -baseOffset, lon: baseOffset },          // Southeast
        { lat: -baseOffset, lon: -baseOffset },         // Southwest
        { lat: baseOffset * 1.2, lon: 0 },              // North
        { lat: -baseOffset * 1.2, lon: 0 },             // South
        { lat: 0, lon: baseOffset * 1.2 },              // East
        { lat: 0, lon: -baseOffset * 1.2 },             // West
        
        // Medium range offsets (25% of distance)
        { lat: baseOffset * 1.8, lon: baseOffset * 1.8 },
        { lat: baseOffset * 1.8, lon: -baseOffset * 1.8 },
        { lat: -baseOffset * 1.8, lon: baseOffset * 1.8 },
        { lat: -baseOffset * 1.8, lon: -baseOffset * 1.8 },
        
        // Far range offsets (35% of distance)
        { lat: baseOffset * 2.5, lon: baseOffset * 2.5 },
        { lat: baseOffset * 2.5, lon: -baseOffset * 2.5 },
        { lat: -baseOffset * 2.5, lon: baseOffset * 2.5 },
        { lat: -baseOffset * 2.5, lon: -baseOffset * 2.5 },
        
        // Extra wide detours (50% of distance)
        { lat: baseOffset * 3.5, lon: 0 },
        { lat: -baseOffset * 3.5, lon: 0 },
        { lat: 0, lon: baseOffset * 3.5 },
        { lat: 0, lon: -baseOffset * 3.5 },
        
        // Multi-waypoint detours using quarter points
        { lat: baseOffset * 2, lon: baseOffset, quarter: 0.25 },
        { lat: -baseOffset * 2, lon: -baseOffset, quarter: 0.25 },
        { lat: baseOffset, lon: baseOffset * 2, quarter: 0.75 },
        { lat: -baseOffset, lon: -baseOffset * 2, quarter: 0.75 }
      ];
      
      for (const offset of offsets) {
        try {
          let waypoints = [];
          
          // Create waypoint(s) based on offset configuration
          if (offset.quarter) {
            // Multi-waypoint approach for complex detours
            const quarter1Lat = start[0] + (end[0] - start[0]) * 0.25;
            const quarter1Lon = start[1] + (end[1] - start[1]) * 0.25;
            const quarter2Lat = start[0] + (end[0] - start[0]) * 0.75;
            const quarter2Lon = start[1] + (end[1] - start[1]) * 0.75;
            
            waypoints = [
              [quarter1Lat + offset.lat, quarter1Lon + offset.lon],
              [quarter2Lat + offset.lat, quarter2Lon + offset.lon]
            ];
          } else {
            // Single waypoint at midpoint with offset
            waypoints = [[midLat + offset.lat, midLon + offset.lon]];
          }
          
          // Check if any waypoint is blocked
          const anyWaypointBlocked = waypoints.some(wp => isPointBlocked(wp));
          if (anyWaypointBlocked) continue;
          
          // Build coordinate string for OSRM API
          const coords = [
            `${start[1]},${start[0]}`,
            ...waypoints.map(wp => `${wp[1]},${wp[0]}`),
            `${end[1]},${end[0]}`
          ].join(';');
          
          // Request route with waypoint(s)
          const response = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&continue_straight=false`
          );
          
          if (response.data.code === 'Ok' && response.data.routes && response.data.routes[0]) {
            const route = response.data.routes[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const distance = (route.distance / 1000).toFixed(2);
            const duration = Math.round(route.duration / 60);
            const blocked = isRouteBlocked(coordinates);
            
            // Return first non-blocked detour route found
            if (!blocked) {
              console.log(`Found clear detour route with ${waypoints.length} waypoint(s), distance: ${distance}km`);
              return {
                coordinates,
                distance,
                duration,
                blocked: false,
                impossible: false
              };
            }
          }
        } catch (waypointError) {
          // Continue to next waypoint option if this one fails
          continue;
        }
      }
      
      // If no single detour works, try extreme wide detours with multiple waypoints
      console.log('Trying extreme detour routes...');
      const extremeOffsets = [
        { lat: baseOffset * 5, lon: 0 },
        { lat: -baseOffset * 5, lon: 0 },
        { lat: 0, lon: baseOffset * 5 },
        { lat: 0, lon: -baseOffset * 5 }
      ];
      
      for (const offset of extremeOffsets) {
        try {
          const waypoint = [midLat + offset.lat, midLon + offset.lon];
          if (isPointBlocked(waypoint)) continue;
          
          const coords = `${start[1]},${start[0]};${waypoint[1]},${waypoint[0]};${end[1]},${end[0]}`;
          const response = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&continue_straight=false`
          );
          
          if (response.data.code === 'Ok' && response.data.routes && response.data.routes[0]) {
            const route = response.data.routes[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const distance = (route.distance / 1000).toFixed(2);
            const duration = Math.round(route.duration / 60);
            const blocked = isRouteBlocked(coordinates);
            
            if (!blocked) {
              console.log(`Found extreme detour route, distance: ${distance}km`);
              return {
                coordinates,
                distance,
                duration,
                blocked: false,
                impossible: false
              };
            }
          }
        } catch (extremeError) {
          continue;
        }
      }
    } catch (error) {
      console.warn('Detour route failed:', error.message);
    }
    
    return null;
  };

  const toggleAgentPlacementMode = () => {
    setAgentPlacementMode(!agentPlacementMode);
    setPendingAgent(null);
    setBlockPlacementMode(false);
  };

  const toggleBlockPlacementMode = () => {
    setBlockPlacementMode(!blockPlacementMode);
    setAgentPlacementMode(false);
    setPendingAgent(null);
  };

  const clearAll = () => {
    setAgents([]);
    setPaths([]);
    setPendingAgent(null);
    setRoadBlocks([]);
  };

  const removeBlock = (blockId) => {
    setRoadBlocks(prev => prev.filter(b => b.id !== blockId));
    if (paths.length > 0) {
      setTimeout(() => recalculateRoutes(), 100);
    }
  };

  const recalculateRoutes = async () => {
    if (agents.length === 0) return;

    setIsRunning(true);
    const newPaths = [];

    for (const agent of agents) {
      if (agent.start && agent.end) {
        // Try to find alternative route if available
        const routeData = await getRoadRoute(agent.start, agent.end, true);
        
        // If route has alternative (blocked primary + clear alternative)
        if (routeData.hasAlternative) {
          // Add blocked primary route
          newPaths.push({
            id: `${agent.id}-blocked`,
            agentId: agent.id,
            ...routeData.primary,
            color: agent.color,
            isPrimary: true,
            isAlternative: false
          });
          
          // Add clear alternative route
          newPaths.push({
            id: `${agent.id}-alt`,
            agentId: agent.id,
            ...routeData.alternative,
            color: agent.color,
            isPrimary: false,
            isAlternative: true
          });
        } else {
          // Single route (either clear or blocked with no alternative)
          newPaths.push({
            id: agent.id,
            agentId: agent.id,
            ...routeData,
            color: agent.color,
            isPrimary: true,
            isAlternative: false
          });
        }
      }
    }

    setPaths(newPaths);
    setIsRunning(false);
  };

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

    await recalculateRoutes();
  };

  return (
    <div className="min-h-screen bg-neutral-900">

      {/* Map Section - Full Width */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-700">
            {agentPlacementMode && pendingAgent && (
              <div className="bg-blue-600 px-4 py-3 text-white text-sm font-medium">
                🎯 {pendingAgent.start ? 'Click on map to set END point' : 'Click on map to set START point'}
              </div>
            )}
            {blockPlacementMode && (
              <div className="bg-neutral-700 px-4 py-3 text-white text-sm font-medium">
                🚫 Click on map to place ROAD BLOCK
              </div>
            )}
            
            <div style={{ height: '500px', position: 'relative' }}>
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

                <MapClickHandler />

                {pendingAgent && pendingAgent.start && (
                  <Marker
                    position={pendingAgent.start}
                    icon={createCustomIcon(pendingAgent.color, 'S')}
                  >
                    <Popup>{pendingAgent.name} - Start</Popup>
                  </Marker>
                )}

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

                {paths.map((path) => {
                  // Alternative routes are green and solid
                  const routeColor = path.isAlternative ? '#10b981' : (path.blocked ? '#fbbf24' : path.color);
                  const routeWeight = path.isAlternative ? 5 : 4;
                  const routeOpacity = path.isAlternative ? 0.9 : (path.blocked ? 0.5 : 0.7);
                  const routeDash = path.blocked && !path.isAlternative ? '10, 10' : null;
                  
                  return (
                    <Polyline
                      key={path.id}
                      positions={path.coordinates}
                      color={routeColor}
                      weight={routeWeight}
                      opacity={routeOpacity}
                      dashArray={routeDash}
                    />
                  );
                })}

                {roadBlocks.map((block) => (
                  <div key={block.id}>
                    <Marker
                      position={block.position}
                      icon={createBlockIcon()}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold text-red-600">Road Block</p>
                          <p className="text-xs text-gray-600">Radius: {block.radius} km</p>
                          <button
                            onClick={() => removeBlock(block.id)}
                            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={block.position}
                      radius={block.radius * 1000}
                      pathOptions={{
                        color: '#ef4444',
                        fillColor: '#ef4444',
                        fillOpacity: 0.2,
                        weight: 2
                      }}
                    />
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section - Below Map */}
      <div className="bg-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Actions Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">🎮</span> Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={toggleAgentPlacementMode}
                  className={`w-full py-2.5 px-4 rounded-md font-medium transition-all ${
                    agentPlacementMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-600'
                  }`}
                >
                  {agentPlacementMode ? '✓ Agent Mode Active' : '+ Add Agent'}
                </button>

                <button
                  onClick={toggleBlockPlacementMode}
                  className={`w-full py-2.5 px-4 rounded-md font-medium transition-all ${
                    blockPlacementMode
                      ? 'bg-neutral-600 text-white shadow-lg'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-600'
                  }`}
                >
                  {blockPlacementMode ? '✓ Block Mode Active' : '🚫 Add Block'}
                </button>

                <button
                  onClick={runSimulation}
                  disabled={agents.length === 0 || isRunning}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
                >
                  {isRunning ? '⏳ Running...' : '▶️ Run Simulation'}
                </button>

                <button
                  onClick={clearAll}
                  disabled={agents.length === 0 && roadBlocks.length === 0}
                  className="w-full bg-neutral-800 text-white py-2.5 px-4 rounded-md hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all border border-neutral-600"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            {/* Route Results Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">📊</span> Route Results
              </h3>
              <div className="space-y-3">
                {paths.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2 text-neutral-600">🗺️</div>
                    <p className="text-neutral-500 text-xs">No routes yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {agents.map(agent => {
                      const agentPaths = paths.filter(p => 
                        p.id === agent.id || p.agentId === agent.id
                      );
                      
                      if (agentPaths.length === 0) return null;
                      
                      const primaryPath = agentPaths.find(p => p.isPrimary);
                      const alternativePath = agentPaths.find(p => p.isAlternative);
                      
                      return (
                        <div key={agent.id} className="space-y-1">
                          {primaryPath && (
                            <div className="bg-neutral-800 rounded p-2 border-l-2 border-blue-500">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-white text-sm">{agent.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  primaryPath.blocked ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-700 text-neutral-300'
                                }`}>
                                  {primaryPath.blocked ? '⚠️ Blocked' : '✅ Clear'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-xs text-neutral-400">
                                <div>{primaryPath.distance} km</div>
                                <div>{primaryPath.duration} min</div>
                              </div>
                            </div>
                          )}
                          
                          {alternativePath && (
                            <div className="bg-neutral-800 rounded p-2 border-l-2 border-blue-600">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-blue-400 text-sm">🔄 Alternative</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">
                                  ✅ Safe
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-xs text-neutral-400">
                                <div>{alternativePath.distance} km</div>
                                <div>{alternativePath.duration} min</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Road Blocks Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">🚫</span> Blocks ({roadBlocks.length})
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {roadBlocks.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center py-6">No blocks placed</p>
                ) : (
                  roadBlocks.map((block, index) => (
                    <div key={block.id} className="bg-neutral-800 rounded p-2 flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm">Block {index + 1}</div>
                        <div className="text-neutral-400 text-xs">{block.radius} km radius</div>
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-neutral-400 hover:text-white text-sm px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Agents List Card */}
            <div className="bg-black rounded-lg p-4 shadow-lg border border-neutral-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">👥</span> Agents ({agents.length})
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {agents.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center py-6">No agents added</p>
                ) : (
                  agents.map(agent => (
                    <div 
                      key={agent.id}
                      className="bg-neutral-800 rounded p-2 border-l-2 border-blue-500"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-sm">{agent.name}</span>
                        <button
                          onClick={() => setAgents(prev => prev.filter(a => a.id !== agent.id))}
                          className="text-neutral-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1 text-xs">
                        <span className={`px-2 py-0.5 rounded ${
                          agent.start ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-700 text-neutral-500'
                        }`}>
                          {agent.start ? '✓ Start' : '○ Start'}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          agent.end ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-700 text-neutral-500'
                        }`}>
                          {agent.end ? '✓ End' : '○ End'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvacuationInterface;