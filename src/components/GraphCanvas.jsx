import React, { useState } from 'react';
import Node from './Node';
import Edge from './Edge';

const GraphCanvas = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [addingEdge, setAddingEdge] = useState(null);

    const addNode = (e) => {
        const newNode = {
            id: nodes.length + 1,
            x: e.clientX,
            y: e.clientY
        };
        setNodes([...nodes, newNode]);
    };

    const startEdge = (id) => setAddingEdge(id);

    const completeEdge = (toId) => {
        if (addingEdge && addingEdge !== toId) {
            const weight = prompt('Enter edge weight:');
            if (weight) {
                setEdges([...edges, { from: addingEdge, to: toId, weight }]);
            }
        }
        setAddingEdge(null);
    };

    return (
        <svg className="w-full h-screen bg-gray-100" onClick={addNode}>
            {edges.map((edge, index) => {
                const from = nodes.find(n => n.id === edge.from);
                const to = nodes.find(n => n.id === edge.to);
                return from && to ? <Edge key={index} from={from} to={to} weight={edge.weight} /> : null;
            })}
            {nodes.map(node => (
                <Node
                    key={node.id}
                    id={node.id}
                    x={node.x}
                    y={node.y}
                    onMouseDown={() => startEdge(node.id)}
                    onMouseUp={() => completeEdge(node.id)}
                />
            ))}
        </svg>
    );
};

export default GraphCanvas;
