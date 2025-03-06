export function runDFS(nodes, edges, startNode, endNode = null, stepByStep = false) {
    const visited = new Set();
    const stack = [startNode];
    const previous = {};
    const steps = stepByStep ? [] : null;

    while (stack.length > 0) {
        const currentNode = stack.pop();
        if (!visited.has(currentNode)) {
            visited.add(currentNode);
            if (stepByStep) steps.push({ visited: [...visited], stack: [...stack], current: currentNode });
            if (endNode && currentNode === endNode) break;

            const neighbors = edges
                .filter(edge => edge.start === currentNode || edge.end === currentNode)
                .map(edge => edge.start === currentNode ? edge.end : edge.start)
                .filter(neighbor => !visited.has(neighbor));

            for (let neighbor of neighbors) {
                stack.push(neighbor);
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
        steps.push({ visited: [...visited], stack: [], current: endNode || null });
        return { visited: [...visited], path, steps };
    }
    return { visited: [...visited], path };
}