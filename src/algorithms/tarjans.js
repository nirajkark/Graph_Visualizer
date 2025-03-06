export function runTarjans(nodes, edges, stepByStep = false) {
    const index = {};
    const lowLink = {};
    const stack = [];
    const sccs = [];
    const steps = stepByStep ? [] : null;
    let idx = 0;

    function strongConnect(node) {
        index[node] = lowLink[node] = idx++;
        stack.push(node);
        const onStack = new Set(stack);

        const neighbors = edges.filter(edge => edge.start === node).map(edge => edge.end);
        for (let neighbor of neighbors) {
            if (!(neighbor in index)) {
                strongConnect(neighbor);
                lowLink[node] = Math.min(lowLink[node], lowLink[neighbor]);
            } else if (onStack.has(neighbor)) {
                lowLink[node] = Math.min(lowLink[node], index[neighbor]);
            }
        }

        if (lowLink[node] === index[node]) {
            const scc = [];
            let w;
            do {
                w = stack.pop();
                onStack.delete(w);
                scc.push(w);
            } while (w !== node);
            sccs.push(scc);
            if (stepByStep) steps.push({ sccs: [...sccs], stack: [...stack] });
        }
    }

    nodes.forEach(node => {
        if (!(node.id in index)) strongConnect(node.id);
    });

    if (stepByStep) return { sccs, steps };
    return { sccs };
}