// algorithms.js
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

export function runPrims(nodes, edges, startNode, stepByStep = false) {
    const visited = new Set([startNode]);
    const mstEdges = [];
    const steps = stepByStep ? [] : null;
    const availableEdges = [...edges]; // Clone edges to avoid modifying original

    while (visited.size < nodes.length) {
        let minEdge = null;
        let minWeight = Infinity;

        // Check all edges connecting visited nodes to unvisited nodes
        for (let edge of availableEdges) {
            const { start, end, weight } = edge;
            if (visited.has(start) && !visited.has(end)) {
                if (weight < minWeight) {
                    minEdge = { start, end, weight };
                    minWeight = weight;
                }
            } else if (visited.has(end) && !visited.has(start)) {
                if (weight < minWeight) {
                    minEdge = { start: end, end: start, weight };
                    minWeight = weight;
                }
            }
        }

        if (!minEdge) break; // No more edges to connect unvisited nodes
        mstEdges.push(minEdge);
        visited.add(minEdge.end);
        if (stepByStep) steps.push({ mstEdges: [...mstEdges], visited: [...visited] });
    }

    if (visited.size !== nodes.length) {
        console.warn('Graph is disconnected; MST only includes reachable nodes:', visited);
    }

    if (stepByStep) return { mstEdges, steps };
    return { mstEdges };
}

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