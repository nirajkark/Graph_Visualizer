import React from 'react';

const Edge = ({ from, to, weight }) => (
    <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#94a3b8"
        strokeWidth="2"
        markerEnd="url(#arrow)"
    />
);

export default Edge;
