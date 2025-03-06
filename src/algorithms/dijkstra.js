export function runDijkstra(nodes, edges, startNode, endNode, stepByStep = false) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    const steps = stepByStep ? [] : null;

    nodes.forEach(node => {
        distances[node.id] = node.id === startNode ? 0 : Infinity;
        unvisited.add(node.id);
    });

    while (unvisited.size > 0) {
        let currentNode = null;
        let minDistance = Infinity;

        for (let nodeId of unvisited) {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                currentNode = nodeId;
            }
        }

        if (currentNode === null) break;
        if (endNode && currentNode === endNode) break;

        unvisited.delete(currentNode);

        const neighbors = edges
            .filter(edge => edge.start === currentNode || edge.end === currentNode)
            .map(edge => edge.start === currentNode ? edge.end : edge.start);

        for (let neighbor of neighbors) {
            if (unvisited.has(neighbor)) {
                const edge = edges.find(e => (e.start === currentNode && e.end === neighbor) || (e.start === neighbor && e.end === currentNode));
                const newDistance = distances[currentNode] + edge.weight;
                if (newDistance < distances[neighbor]) {
                    distances[neighbor] = newDistance;
                    previous[neighbor] = currentNode;
                }
            }
        }

        if (stepByStep) {
            const pathSoFar = [];
            let temp = currentNode;
            while (temp !== undefined) {
                pathSoFar.unshift(temp);
                temp = previous[temp];
                if (temp === startNode) break;
            }
            steps.push({ pathSoFar, currentDistances: { ...distances } });
        }
    }

    const path = [];
    if (endNode && distances[endNode] !== Infinity) {
        let current = endNode;
        while (current !== undefined) {
            path.unshift(current);
            current = previous[current];
        }
    }

    if (stepByStep) {
        steps.push({ pathSoFar: path, currentDistances: { ...distances } });
        return { distances, path, steps };
    }
    return { distances, path };
}