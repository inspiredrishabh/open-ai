import React, { useState, useCallback, useEffect } from 'react';
import MapView from './MapView';
import { findPath, calculateDistance, findNearestSafetyPoints } from '../utils/pathfinding';

const agentColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
];

// Safety points data
const safetyPointsData = [
  { id: 1, type: 'hospital', name: 'City Hospital', lat: 28.6139, lon: 77.2090, icon: '♦' },
  { id: 2, type: 'police', name: 'Police Station', lat: 28.6129, lon: 77.2295, icon: '■' },
  { id: 3, type: 'fire', name: 'Fire Station', lat: 28.6169, lon: 77.2060, icon: '▲' },
  { id: 4, type: 'shelter', name: 'Emergency Shelter', lat: 28.6180, lon: 77.2140, icon: '●' },
  { id: 5, type: 'hospital', name: 'AIIMS', lat: 28.5672, lon: 77.2100, icon: '♦' },
  { id: 6, type: 'police', name: 'Central Police', lat: 28.6280, lon: 77.2200, icon: '■' },
];

export default function EvacuationInterface({ initialLat = 28.6139, initialLon = 77.2090 }) {
  const [agents, setAgents] = useState([]);
  const [emergencyBlocks, setEmergencyBlocks] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [safetyPoints, setSafetyPoints] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lon: initialLon });

  // Update map center when initial coordinates change
  useEffect(() => {
    setMapCenter({ lat: initialLat, lon: initialLon });
  }, [initialLat, initialLon]);

  // Add new evacuation agent
  const addAgent = useCallback(() => {
    const newAgent = {
      id: Date.now(),
      name: `Agent ${agents.length + 1}`,
      start: null,
      end: null,
      color: agentColors[agents.length % agentColors.length]
    };
    setAgents(prev => [...prev, newAgent]);
  }, [agents.length]);

  // Remove agent
  const removeAgent = useCallback((agentId) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    setRoutes(prev => prev.filter(r => r.agentId !== agentId));
  }, []);

  // Add emergency block
  const addEmergencyBlock = useCallback(() => {
    const lat = prompt('Enter latitude for emergency block:');
    const lon = prompt('Enter longitude for emergency block:');
    
    if (lat && lon) {
      const newBlock = {
        id: Date.now(),
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radius: 0.002 // approximately 200m
      };
      setEmergencyBlocks(prev => [...prev, newBlock]);
    }
  }, []);

  // Remove emergency block
  const removeEmergencyBlock = useCallback((blockId) => {
    setEmergencyBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);

  // Set agent start point
  const setAgentStart = useCallback((agentId) => {
    const lat = prompt('Enter start latitude:');
    const lon = prompt('Enter start longitude:');
    
    if (lat && lon) {
      setAgents(prev => prev.map(agent =>
        agent.id === agentId
          ? { ...agent, start: { lat: parseFloat(lat), lon: parseFloat(lon) } }
          : agent
      ));
    }
  }, []);

  // Set agent end point
  const setAgentEnd = useCallback((agentId) => {
    const lat = prompt('Enter end latitude:');
    const lon = prompt('Enter end longitude:');
    
    if (lat && lon) {
      setAgents(prev => prev.map(agent =>
        agent.id === agentId
          ? { ...agent, end: { lat: parseFloat(lat), lon: parseFloat(lon) } }
          : agent
      ));
    }
  }, []);

  // Run simulation
  const runSimulation = useCallback(async () => {
    setSimulationRunning(true);
    const newRoutes = [];
    const newSafetyPoints = [];

    // Create blocked cells set
    const blockedCells = new Set();
    emergencyBlocks.forEach(block => {
      // Create a grid of blocked cells around each emergency block
      for (let latOffset = -block.radius; latOffset <= block.radius; latOffset += 0.0001) {
        for (let lonOffset = -block.radius; lonOffset <= block.radius; lonOffset += 0.0001) {
          const distance = Math.sqrt(latOffset * latOffset + lonOffset * lonOffset);
          if (distance <= block.radius) {
            const key = `${(block.lat + latOffset).toFixed(6)},${(block.lon + lonOffset).toFixed(6)}`;
            blockedCells.add(key);
          }
        }
      }
    });

    // Calculate routes for each agent
    for (const agent of agents) {
      if (agent.start && agent.end) {
        const path = findPath([], agent.start, agent.end, blockedCells);
        
        if (path.length > 0) {
          const distance = calculateDistance(agent.start, agent.end);
          const nearbyPoints = findNearestSafetyPoints(path, safetyPointsData);
          
          newRoutes.push({
            agentId: agent.id,
            path,
            distance: distance.toFixed(2),
            duration: Math.round(distance * 12), // Assume 5 km/h walking speed
            status: 'clear',
            color: agent.color
          });

          newSafetyPoints.push(...nearbyPoints);
        } else {
          newRoutes.push({
            agentId: agent.id,
            path: [],
            distance: 0,
            duration: 0,
            status: 'blocked',
            error: 'No path available due to emergency blocks',
            color: agent.color
          });
        }
      }
    }

    setRoutes(newRoutes);
    setSafetyPoints(newSafetyPoints);
    setSimulationRunning(false);
  }, [agents, emergencyBlocks]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header Section */}
      <div className="bg-neutral-800 border-b border-neutral-700 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white">Emergency Evacuation Planning</h1>
          <p className="text-neutral-400 mt-2">Plan optimal evacuation routes with multiple agents and safety point detection</p>
        </div>
      </div>
      
      <div className="flex flex-col">
        {/* Map Section */}
        <div className="bg-neutral-800 border-t border-neutral-700 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-4">
              <p className="text-neutral-400 text-sm">
                Current Location: {mapCenter.lat.toFixed(4)}, {mapCenter.lon.toFixed(4)}
              </p>
            </div>
            <div className="bg-neutral-700 rounded-lg overflow-hidden border border-neutral-600" style={{ height: '400px' }}>
              <MapView 
                lat={mapCenter.lat} 
                lon={mapCenter.lon}
                onMapClick={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Control panels section */}
        <div className="min-h-[50vh] bg-neutral-800 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Evacuation Control Center</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Evacuation Agents */}
              <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Evacuation Agents</h3>
                </div>
                
                <button
                  onClick={addAgent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors"
                >
                  + Add Evacuation Agent
                </button>
                
                <div className="text-sm text-neutral-300 mb-2">
                  Active Agents: <span className="text-blue-400">{agents.length}</span>
                </div>
                
                <button
                  onClick={runSimulation}
                  disabled={agents.length === 0 || simulationRunning}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {simulationRunning ? 'Running...' : 'Run Simulation'}
                </button>
              </div>

              {/* Emergency Blocks */}
              <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-0.5 bg-white rounded"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Emergency Blocks</h3>
                </div>
                
                <button
                  onClick={addEmergencyBlock}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors"
                >
                  Add Road Block
                </button>
                
                <div className="text-sm text-neutral-300">
                  Active Blocks: <span className="text-orange-400">{emergencyBlocks.length}</span>
                </div>
              </div>

              {/* Route Results */}
              <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Route Results</h3>
                </div>
                
                {routes.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <div className="w-12 h-12 bg-neutral-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" />
                      </svg>
                    </div>
                    <div className="text-sm">No routes calculated yet</div>
                    <div className="text-xs mt-1">Add evacuation agents and run simulation</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {routes.map(route => (
                      <div key={route.agentId} className="text-xs bg-neutral-600 rounded p-2 border border-neutral-500">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: route.color }}
                          ></div>
                          <span className="text-white font-medium">Agent {route.agentId}</span>
                        </div>
                        {route.path.length > 0 ? (
                          <div className="text-neutral-300 mt-1">
                            <div>Distance: {route.distance} km</div>
                            <div>Duration: {route.duration} min</div>
                          </div>
                        ) : (
                          <div className="text-red-400 mt-1">No path found</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety Points */}
              <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Nearby Safety Points</h3>
                </div>
                
                {safetyPoints.length === 0 ? (
                  <div className="text-center py-4 text-neutral-400 text-sm">
                    Run simulation to find nearby safety points
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {safetyPoints.slice(0, 5).map((point, index) => (
                      <div key={index} className="text-xs bg-neutral-600 rounded p-2 border border-neutral-500">
                        <div className="flex items-center gap-2 text-white">
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                          <span className="font-medium">{point.name}</span>
                        </div>
                        <div className="text-neutral-300 mt-1">
                          <div>Type: {point.type}</div>
                          <div>Distance: {point.distance?.toFixed(2)} km</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Agent Configuration */}
            {agents.length > 0 && (
              <div className="mt-6 bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-white">Configure Agents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map(agent => (
                    <div key={agent.id} className="bg-neutral-600 rounded-lg p-3 border border-neutral-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: agent.color }}
                          ></div>
                          <span className="font-medium text-white">{agent.name}</span>
                        </div>
                        <button
                          onClick={() => removeAgent(agent.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => setAgentStart(agent.id)}
                          className="w-full py-1 px-2 rounded text-xs transition-colors bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          {agent.start ? `Start: ${agent.start.lat.toFixed(3)}, ${agent.start.lon.toFixed(3)}` : 'Set Start Point'}
                        </button>
                        
                        <button
                          onClick={() => setAgentEnd(agent.id)}
                          className="w-full py-1 px-2 rounded text-xs transition-colors bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          {agent.end ? `End: ${agent.end.lat.toFixed(3)}, ${agent.end.lon.toFixed(3)}` : 'Set End Point'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-200 mb-2">How to Use</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-300">
                <div>
                  <strong>1. Add Agents:</strong> Click "Add Evacuation Agent" to create evacuation routes
                </div>
                <div>
                  <strong>2. Set Points:</strong> Click agent buttons and enter latitude/longitude coordinates
                </div>
                <div>
                  <strong>3. Add Blocks:</strong> Click "Add Road Block" and enter coordinates for blocked areas
                </div>
                <div>
                  <strong>4. Run Simulation:</strong> Calculate optimal routes and view safety points
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}