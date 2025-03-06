import React from 'react';

const Node = ({ id, x, y, onMouseDown }) => (
    <circle
        cx={x}
        cy={y}
        r="20"
        fill="#60a5fa"
        stroke="#1e3a8a"
        strokeWidth="2"
        onMouseDown={(e) => onMouseDown(e, id)}
    />
);

export default Node;
