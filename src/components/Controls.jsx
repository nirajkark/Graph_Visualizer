import React from 'react';

const Controls = ({ onRunDijkstra }) => (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg space-y-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onRunDijkstra}>Run Dijkstra</button>
    </div>
);

export default Controls;
