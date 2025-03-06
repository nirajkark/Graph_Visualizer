export function runPrims(nodes, edges, startNode, stepByStep = false) {
    const visited = new Set([startNode]);
    const mstEdges = [];
    const steps = stepByStep ? [] : null;
    const availableEdges = [...edges]; // Clone edges to avoid modifying original

    while (visited.size < nodes.length) {
        let minEdge = null;
        let minWeight = Infinity;

        for (let edge of availableEdges) {
            const { start, end, weight } = edge;
            if (visited.has(start) && !visited.has(end) && weight < minWeight) {
                minEdge = edge;
                minWeight = weight;
            } else if (visited.has(end) && !visited.has(start) && weight < minWeight) {
                minEdge = { start: end, end: start, weight };
                minWeight = weight;
            }
        }

        if (!minEdge) break;
        mstEdges.push(minEdge);
        visited.add(minEdge.end);
        if (stepByStep) steps.push({ mstEdges: [...mstEdges], visited: [...visited] });
    }

    if (stepByStep) return { mstEdges, steps };
    return { mstEdges };
}