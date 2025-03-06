export function runTopologicalSort(nodes, edges, stepByStep = false) {
    const visited = new Set();
    const stack = [];
    const steps = stepByStep ? [] : null;

    function dfs(node) {
        visited.add(node);
        const neighbors = edges
            .filter(edge => edge.start === node)
            .map(edge => edge.end)
            .filter(neighbor => !visited.has(neighbor));

        for (let neighbor of neighbors) {
            dfs(neighbor);
        }
        stack.push(node);
        if (stepByStep) steps.push({ visited: [...visited], stack: [...stack], current: node });
    }

    nodes.forEach(node => {
        if (!visited.has(node.id)) dfs(node.id);
    });

    const order = stack.reverse();
    if (stepByStep) return { order, steps };
    return { order };
}