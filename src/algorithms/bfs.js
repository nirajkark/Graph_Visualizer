export function runBFS(nodes, edges, startNode, endNode = null, stepByStep = false) {
    const visited = new Set();
    const queue = [startNode];
    const previous = {};
    const steps = stepByStep ? [] : null;

    visited.add(startNode);

    while (queue.length > 0) {
        const currentNode = queue.shift();
        if (stepByStep) steps.push({ visited: [...visited], queue: [...queue], current: currentNode });
        if (endNode && currentNode === endNode) break;

        const neighbors = edges
            .filter(edge => edge.start === currentNode || edge.end === currentNode)
            .map(edge => edge.start === currentNode ? edge.end : edge.start)
            .filter(neighbor => !visited.has(neighbor));

        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                previous[neighbor] = currentNode;
            }
        }
    }

    const path = [];
    if (endNode && visited.has(endNode)) {
        let current = endNode;
        while (current !== undefined) {
            path.unshift(current);
            current = previous[current];
        }
    }

    if (stepByStep) {
        steps.push({ visited: [...visited], queue: [], current: endNode || null });
        return { visited: [...visited], path, steps };
    }
    return { visited: [...visited], path };
}