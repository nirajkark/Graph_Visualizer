// dijkstra.js
export function runDijkstra(nodes, edges, startNode, endNode, stepByStep = false) {
    const distances = {};
    const previous = {};
    const unvisited = new Set(nodes.map(node => node.id));
    const steps = stepByStep ? [] : null;

    // Initialize distances
    nodes.forEach(node => {
        distances[node.id] = node.id === startNode ? 0 : Infinity;
    });

    while (unvisited.size > 0) {
        // Find the unvisited node with the smallest distance
        let currentNode = null;
        let minDistance = Infinity;
        for (let nodeId of unvisited) {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                currentNode = nodeId;
            }
        }

        if (currentNode === null) break; // No reachable nodes left
        if (currentNode === endNode) break; // Reached the target

        unvisited.delete(currentNode);

        // Get neighbors
        const neighbors = edges.filter(edge => edge.start === currentNode || edge.end === currentNode);
        for (let edge of neighbors) {
            const neighbor = edge.start === currentNode ? edge.end : edge.start;
            if (!unvisited.has(neighbor)) continue;

            const newDistance = distances[currentNode] + edge.weight;
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = currentNode;
            }
        }

        // Record step for step-by-step mode
        if (stepByStep) {
            const currentDistances = { ...distances };
            const pathSoFar = [];
            let node = currentNode;
            while (node !== undefined) {
                pathSoFar.unshift(node);
                node = previous[node];
            }
            steps.push({ pathSoFar, currentDistances });
        }
    }

    // Reconstruct the shortest path
    const path = [];
    let current = endNode;
    while (current !== undefined) {
        path.unshift(current);
        current = previous[current];
    }

    if (stepByStep) {
        steps.push({ pathSoFar: path, currentDistances: distances }); // Final step
        return { distances, path, steps };
    }
    return { distances, path };
}