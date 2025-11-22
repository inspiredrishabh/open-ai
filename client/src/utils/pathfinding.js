// Pathfinding utility using A* algorithm
function heuristic(a, b) {
  const dx = Math.abs(a.lat - b.lat);
  const dy = Math.abs(a.lon - b.lon);
  return dx + dy; // Manhattan distance
}

class TinyQueue {
  constructor(data = [], compare = (a, b) => a - b) {
    this.data = data;
    this.length = this.data.length;
    this.compare = compare;
    
    if (this.length > 0) {
      for (let i = Math.floor(this.length / 2) - 1; i >= 0; i--) {
        this._down(i);
      }
    }
  }

  push(item) {
    this.data.push(item);
    this.length++;
    this._up(this.length - 1);
  }

  pop() {
    if (this.length === 0) return undefined;
    
    const top = this.data[0];
    const bottom = this.data.pop();
    this.length--;
    
    if (this.length > 0) {
      this.data[0] = bottom;
      this._down(0);
    }
    
    return top;
  }

  _up(pos) {
    const { data, compare } = this;
    const item = data[pos];
    
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const current = data[parent];
      if (compare(item, current) >= 0) break;
      data[pos] = current;
      pos = parent;
    }
    
    data[pos] = item;
  }

  _down(pos) {
    const { data, compare } = this;
    const halfLength = this.length >> 1;
    const item = data[pos];
    
    while (pos < halfLength) {
      let left = (pos << 1) + 1;
      let right = left + 1;
      let best = data[left];
      
      if (right < this.length && compare(data[right], best) < 0) {
        left = right;
        best = data[right];
      }
      
      if (compare(best, item) >= 0) break;
      
      data[pos] = best;
      pos = left;
    }
    
    data[pos] = item;
  }
}

export function findPath(grid, start, end, blockedCells = new Set()) {
  if (!start || !end || !grid || grid.length === 0) return [];
  
  if (start.lat === end.lat && start.lon === end.lon) {
    return [start];
  }

  const openSet = new TinyQueue([], (a, b) => a.f - b.f);
  const closedSet = new Set();
  const cameFrom = {};
  const gScore = {};

  const key = (p) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
  const startKey = key(start);

  gScore[startKey] = 0;
  const startFScore = heuristic(start, end);

  openSet.push({ node: start, f: startFScore });

  let iterations = 0;
  const maxIterations = 1000;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    const { node: current } = openSet.pop();
    const currentKey = key(current);
    
    if (closedSet.has(currentKey)) {
      continue;
    }

    closedSet.add(currentKey);

    if (Math.abs(current.lat - end.lat) < 0.001 && Math.abs(current.lon - end.lon) < 0.001) {
      let path = [current];
      let k = currentKey;
      while (cameFrom[k]) {
        path.unshift(cameFrom[k]);
        k = key(cameFrom[k]);
      }
      return path;
    }

    // Generate neighbors (8-directional movement)
    const stepSize = 0.001; // Approximately 100m
    const neighbors = [
      { lat: current.lat + stepSize, lon: current.lon, cost: 1 },
      { lat: current.lat - stepSize, lon: current.lon, cost: 1 },
      { lat: current.lat, lon: current.lon + stepSize, cost: 1 },
      { lat: current.lat, lon: current.lon - stepSize, cost: 1 },
      { lat: current.lat + stepSize, lon: current.lon + stepSize, cost: 1.4 },
      { lat: current.lat + stepSize, lon: current.lon - stepSize, cost: 1.4 },
      { lat: current.lat - stepSize, lon: current.lon + stepSize, cost: 1.4 },
      { lat: current.lat - stepSize, lon: current.lon - stepSize, cost: 1.4 },
    ];

    for (const neighbor of neighbors) {
      const neighborKey = key(neighbor);

      if (
        closedSet.has(neighborKey) ||
        blockedCells.has(neighborKey)
      ) {
        continue;
      }

      const tentativeG = (gScore[currentKey] || 0) + neighbor.cost;

      if (tentativeG < (gScore[neighborKey] || Infinity)) {
        cameFrom[neighborKey] = current;
        gScore[neighborKey] = tentativeG;
        const fScore = tentativeG + heuristic(neighbor, end);

        openSet.push({ node: neighbor, f: fScore });
      }
    }
  }

  return []; // No path found
}

// Calculate distance between two points in kilometers
export function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lon - point1.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find nearest safety points along a route
export function findNearestSafetyPoints(route, safetyPoints) {
  if (!route || route.length === 0) return [];
  
  const nearbyPoints = [];
  const maxDistance = 2; // 2km radius
  
  for (const routePoint of route) {
    for (const safetyPoint of safetyPoints) {
      const distance = calculateDistance(routePoint, safetyPoint);
      if (distance <= maxDistance) {
        const existing = nearbyPoints.find(p => p.id === safetyPoint.id);
        if (!existing || distance < existing.distance) {
          nearbyPoints.push({
            ...safetyPoint,
            distance: distance,
            routePoint: routePoint
          });
        }
      }
    }
  }
  
  return nearbyPoints.sort((a, b) => a.distance - b.distance);
}