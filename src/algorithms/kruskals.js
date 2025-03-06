export function runKruskals(nodes, edges, stepByStep = false) {
    const parent = {};
    const rank = {};
    const mstEdges = [];
    const steps = stepByStep ? [] : null;

    nodes.forEach(node => {
        parent[node.id] = node.id;
        rank[node.id] = 0;
    });

    function find(node) {
        if (parent[node] !== node) parent[node] = find(parent[node]);
        return parent[node];
    }

    function union(node1, node2) {
        const root1 = find(node1);
        const root2 = find(node2);
        if (root1 !== root2) {
            if (rank[root1] < rank[root2]) parent[root1] = root2;
            else if (rank[root1] > rank[root2]) parent[root2] = root1;
            else {
                parent[root2] = root1;
                rank[root1]++;
            }
        }
    }

    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    for (let edge of sortedEdges) {
        if (find(edge.start) !== find(edge.end)) {
            mstEdges.push(edge);
            union(edge.start, edge.end);
            if (stepByStep) steps.push({ mstEdges: [...mstEdges] });
        }
    }

    if (stepByStep) return { mstEdges, steps };
    return { mstEdges };
}