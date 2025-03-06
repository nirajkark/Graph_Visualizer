export function runBellmanFord(nodes, edges, startNode, endNode = null, stepByStep = false) {
    const distances = {};
    const previous = {};
    const steps = stepByStep ? [] : null;

    nodes.forEach(node => distances[node.id] = node.id === startNode ? 0 : Infinity);

    for (let i = 0; i < nodes.length - 1; i++) {
        for (let edge of edges) {
            const { start, end, weight } = edge;
            if (distances[start] + weight < distances[end]) {
                distances[end] = distances[start] + weight;
                previous[end] = start;
            }
        }
        if (stepByStep) steps.push({ distances: { ...distances }, current: null });
    }

    for (let edge of edges) {
        const { start, end, weight } = edge;
        if (distances[start] + weight < distances[end]) {
            console.warn('Negative cycle detected!');
            return { distances: {}, path: [], steps: steps || [] };
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
        steps.push({ distances: { ...distances }, path });
        return { distances, path, steps };
    }
    return { distances, path };
}