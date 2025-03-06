import React, { useState, useRef, useEffect } from 'react';
import { runDijkstra } from './algorithms/dijkstra';
import { runBFS } from './algorithms/bfs';
import { runDFS } from './algorithms/dfs';
import { runTopologicalSort } from './algorithms/topologicalSort';
import { runPrims } from './algorithms/prims';
import { runKruskals } from './algorithms/kruskals';
import { runTarjans } from './algorithms/tarjans';
import { runBellmanFord } from './algorithms/bellmanFord';
import { Howl } from 'howler';
import './GraphVisualizer.css';

const Toolbar = ({ mode, setMode, gameState, onFindDijkstra, onStepDijkstra, onFindBFS, onStepBFS, onFindDFS, onStepDFS, onTopoSort, onPrims, onKruskals, onTarjans, onBellmanFord, onStartGame, onSave, onLoad, onReset, onUndo, onRedo, canUndo, canRedo }) => (
    <div className="toolbar">
        <button className={mode === 'addNode' ? 'active' : ''} onClick={() => setMode('addNode')} disabled={gameState === 'playing'} aria-label="Add a new node">Add Node</button>
        <button className={mode === 'addEdge' ? 'active' : ''} onClick={() => setMode('addEdge')} disabled={gameState === 'playing'} aria-label="Add an edge">Add Edge</button>
        <button className={mode === 'delete' ? 'active' : ''} onClick={() => setMode('delete')} disabled={gameState === 'playing'} aria-label="Delete nodes or edges">Delete</button>
        <button onClick={onFindDijkstra} disabled={gameState === 'playing'} aria-label="Find Dijkstra's shortest path">Dijkstra</button>
        <button onClick={onStepDijkstra} disabled={gameState === 'playing'} aria-label="Step-by-step Dijkstra">Step Dijkstra</button>
        <button onClick={onFindBFS} disabled={gameState === 'playing'} aria-label="Find BFS path">BFS</button>
        <button onClick={onStepBFS} disabled={gameState === 'playing'} aria-label="Step-by-step BFS">Step BFS</button>
        <button onClick={onFindDFS} disabled={gameState === 'playing'} aria-label="Find DFS path">DFS</button>
        <button onClick={onStepDFS} disabled={gameState === 'playing'} aria-label="Step-by-step DFS">Step DFS</button>
        <button onClick={onTopoSort} disabled={gameState === 'playing'} aria-label="Topological Sort">Topo Sort</button>
        <button onClick={onPrims} disabled={gameState === 'playing'} aria-label="Prim's MST">Prim's</button>
        <button onClick={onKruskals} disabled={gameState === 'playing'} aria-label="Kruskal's MST">Kruskal's</button>
        <button onClick={onTarjans} disabled={gameState === 'playing'} aria-label="Tarjan's SCC">Tarjan's</button>
        <button onClick={onBellmanFord} disabled={gameState === 'playing'} aria-label="Bellman-Ford shortest path">Bellman-Ford</button>
        <button onClick={() => onStartGame('shortPath')} disabled={gameState !== 'setup'}>Short Path Game</button>
        <button onClick={() => onStartGame('connectAll')} disabled={gameState !== 'setup'}>Connect All Game</button>
        <button onClick={onSave} aria-label="Save graph to file">Save Graph</button>
        <button onClick={onLoad} aria-label="Load graph from file">Load Graph</button>
        <button onClick={onReset} aria-label="Reset visualization states">Reset Visualization</button>
        <button onClick={onUndo} disabled={!canUndo} aria-label="Undo last action">Undo</button>
        <button onClick={onRedo} disabled={!canRedo} aria-label="Redo last action">Redo</button>
    </div>
);

const Controls = ({ gameState, mode, startNode, setStartNode, endNode, setEndNode, weight, setWeight, nodes, onCreateEdge, onClear, userPath, gameMode, algorithm }) => (
    <div className="controls">
        {gameState !== 'playing' ? (
            <>
                <div className="control-group">
                    <label>Start Node:</label>
                    <select value={startNode || ''} onChange={(e) => setStartNode(parseInt(e.target.value))}>
                        <option value="">Select</option>
                        {nodes.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
                    </select>
                </div>
                {algorithm !== "Prim's" && algorithm !== "Kruskal's" && algorithm !== "Tarjan's" && algorithm !== "Topological Sort" && (
                    <div className="control-group">
                        <label>End Node:</label>
                        <select value={endNode || ''} onChange={(e) => setEndNode(parseInt(e.target.value))}>
                            <option value="">Select</option>
                            {nodes.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
                        </select>
                    </div>
                )}
                {mode === 'addEdge' && (
                    <div className="control-group">
                        <label>Weight:</label>
                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" min="1" />
                    </div>
                )}
                <div className="button-group">
                    {mode === 'addEdge' && <button onClick={onCreateEdge}>Create Edge</button>}
                    <button onClick={onClear} className="secondary">Clear Graph</button>
                </div>
            </>
        ) : (
            <p>Click nodes to build your path from {startNode} to {endNode}. Current Path: {userPath.join(' → ')}</p>
        )}
    </div>
);

const ResultsPanel = ({ distances, startNode, shortestPath, visitedNodes, topoOrder, mstEdges, sccs, userPath, gameState, gameMode, leaderboard, pathWeight, algorithm }) => (
    <div className="results-panel">
        {Object.keys(distances).length > 0 && (algorithm === 'Dijkstra' || algorithm === 'Bellman-Ford') && (
            <>
                <h3>{algorithm} Results (From Node {startNode})</h3>
                <div className="distances-grid">
                    {Object.entries(distances).map(([node, dist]) => (
                        <div key={node} className="distance-item">
                            <span>Node {node}:</span>
                            <span>{dist === Infinity ? '∞' : dist}</span>
                        </div>
                    ))}
                </div>
                {shortestPath.length > 0 && <p>Shortest Path: {shortestPath.join(' → ')}</p>}
            </>
        )}
        {visitedNodes.length > 0 && (algorithm === 'BFS' || algorithm === 'DFS') && (
            <>
                <h3>{algorithm} Results (From Node {startNode})</h3>
                <p>Visited Nodes: {visitedNodes.join(' → ')}</p>
                {shortestPath.length > 0 && <p>Path to End: {shortestPath.join(' → ')}</p>}
            </>
        )}
        {topoOrder.length > 0 && algorithm === 'Topological Sort' && (
            <>
                <h3>Topological Sort Result</h3>
                <p>Order: {topoOrder.join(' → ')}</p>
            </>
        )}
        {mstEdges.length > 0 && (algorithm === "Prim's" || algorithm === "Kruskal's") && (
            <>
                <h3>{algorithm} MST Result</h3>
                <p>Edges: {mstEdges.map(e => `${e.start} → ${e.end} (${e.weight})`).join(', ')}</p>
            </>
        )}
        {sccs.length > 0 && algorithm === "Tarjan's" && (
            <>
                <h3>Tarjan's SCC Result</h3>
                <p>SCCs: {sccs.map(scc => scc.join(' → ')).join(' | ')}</p>
            </>
        )}
        {userPath.length > 0 && gameMode && (
            <p>Your Path: {userPath.join(' → ')} (Weight: {pathWeight >= Infinity ? '∞' : pathWeight})</p>
        )}
        {gameState === 'completed' && leaderboard.length > 0 && (
            <div className="leaderboard">
                <h3>Leaderboard</h3>
                <ul>
                    {leaderboard.map((entry, i) => (
                        <li key={i}>{`Score: ${entry.score} | Time: ${entry.time}s | ${entry.date}`}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

const GraphVisualizer = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [draggingNode, setDraggingNode] = useState(null);
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [weight, setWeight] = useState('');
    const [shortestPath, setShortestPath] = useState([]);
    const [distances, setDistances] = useState({});
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [topoOrder, setTopoOrder] = useState([]);
    const [mstEdges, setMstEdges] = useState([]);
    const [sccs, setSccs] = useState([]);
    const [mode, setMode] = useState('addNode');
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [gameState, setGameState] = useState('setup');
    const [gameMode, setGameMode] = useState(null);
    const [userPath, setUserPath] = useState([]);
    const [theme, setTheme] = useState('light');
    const [leaderboard, setLeaderboard] = useState(JSON.parse(localStorage.getItem('leaderboard')) || []);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [tooltip, setTooltip] = useState(null);
    const [pathWeight, setPathWeight] = useState(0);
    const [algorithm, setAlgorithm] = useState(null);
    const fileInputRef = useRef(null);

    const sounds = {
        node: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3'] }),
        edge: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-click-error-1110.mp3'] }),
        path: new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'] }),
    };

    useEffect(() => {
        let interval;
        if (isTimerRunning) interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    useEffect(() => {
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }, [leaderboard]);

    useEffect(() => {
        if (userPath.length > 1) {
            let totalWeight = 0;
            for (let i = 0; i < userPath.length - 1; i++) {
                const edge = edges.find(e => 
                    (e.start === userPath[i] && e.end === userPath[i + 1]) || 
                    (e.start === userPath[i + 1] && e.end === userPath[i])
                );
                totalWeight += edge ? edge.weight : Infinity;
            }
            setPathWeight(totalWeight);
        } else {
            setPathWeight(0);
        }
    }, [userPath, edges]);

    const saveState = () => {
        const newState = { nodes: [...nodes], edges: [...edges] };
        setHistory([...history.slice(0, historyIndex + 1), newState]);
        setHistoryIndex(historyIndex + 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setNodes([...history[historyIndex - 1].nodes]);
            setEdges([...history[historyIndex - 1].edges]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setNodes([...history[historyIndex + 1].nodes]);
            setEdges([...history[historyIndex + 1].edges]);
        }
    };

    const handleCanvasClick = (e) => {
        if (mode !== 'addNode' || gameState === 'playing') return;
        saveState();
        const rect = e.target.getBoundingClientRect();
        const newNode = { id: nodes.length + 1, x: e.clientX - rect.left, y: e.clientY - rect.top };
        setNodes([...nodes, newNode]);
        sounds.node.play();
    };

    const handleEdgeCreation = () => {
        if (gameState === 'playing') return;
        if (startNode && endNode && weight && startNode !== endNode) {
            const parsedWeight = parseFloat(weight);
            if (parsedWeight <= 0) {
                alert('Weight must be positive!');
                return;
            }
            if (edges.some(e => (e.start === startNode && e.end === endNode) || (e.start === endNode && e.end === startNode))) {
                alert('Edge already exists!');
                return;
            }
            saveState();
            const newEdge = { start: startNode, end: endNode, weight: parsedWeight };
            setEdges([...edges, newEdge]);
            setWeight('');
            sounds.edge.play();
        } else {
            alert('Please select different nodes and enter a weight!');
        }
    };

    const handleDragStart = (node) => setDraggingNode(node);
    const handleDrag = (e) => {
        if (!draggingNode || gameState === 'playing') return;
        const rect = e.target.closest('svg').getBoundingClientRect();
        setNodes(nodes.map(n => n.id === draggingNode.id ? { ...n, x: e.clientX - rect.left, y: e.clientY - rect.top } : n));
    };
    const handleDragEnd = () => setDraggingNode(null);

    const handleNodeClick = (nodeId) => {
        if (gameState !== 'playing' || !gameMode) return;
        if (!userPath.length && nodeId === startNode) {
            setUserPath([nodeId]);
            sounds.node.play();
        } else if (userPath.length && !userPath.includes(nodeId)) {
            const lastNode = userPath[userPath.length - 1];
            const edgeExists = edges.some(e => 
                (e.start === lastNode && e.end === nodeId) || 
                (e.start === nodeId && e.end === lastNode)
            );
            if (edgeExists) {
                setUserPath([...userPath, nodeId]);
                sounds.node.play();
            } else {
                alert(`No edge exists between Node ${lastNode} and Node ${nodeId}!`);
            }
        }
    };

    const handleFindDijkstra = () => {
        if (!startNode || !endNode) {
            alert('Select both start and end nodes!');
            return;
        }
        const { distances, path } = runDijkstra(nodes, edges, startNode, endNode);
        setDistances(distances);
        setShortestPath(path);
        setVisitedNodes([]);
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('Dijkstra');
        sounds.path.play();
    };

    const handleStepDijkstra = () => {
        if (!startNode || !endNode) {
            alert('Select both start and end nodes!');
            return;
        }
        const { distances, path, steps } = runDijkstra(nodes, edges, startNode, endNode, true);
        if (!steps || !Array.isArray(steps)) {
            console.error('Step-by-step mode failed', steps);
            setDistances(distances);
            setShortestPath(path);
            sounds.path.play();
            return;
        }
        setDistances(distances);
        setShortestPath([]);
        setVisitedNodes([]);
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('Dijkstra');
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setShortestPath(steps[stepIndex].pathSoFar);
                setDistances(steps[stepIndex].currentDistances);
                stepIndex++;
            } else {
                clearInterval(interval);
                setShortestPath(path);
                sounds.path.play();
            }
        }, 500);
    };

    const handleFindBFS = () => {
        if (!startNode) {
            alert('Select a start node!');
            return;
        }
        const { visited, path } = runBFS(nodes, edges, startNode, endNode);
        setVisitedNodes(visited);
        setShortestPath(path);
        setDistances({});
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('BFS');
        sounds.path.play();
    };

    const handleStepBFS = () => {
        if (!startNode) {
            alert('Select a start node!');
            return;
        }
        const { visited, path, steps } = runBFS(nodes, edges, startNode, endNode, true);
        setVisitedNodes(visited);
        setShortestPath([]);
        setDistances({});
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('BFS');
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setVisitedNodes(steps[stepIndex].visited);
                setShortestPath(stepIndex === steps.length - 1 ? path : []);
                stepIndex++;
            } else {
                clearInterval(interval);
                setShortestPath(path);
                sounds.path.play();
            }
        }, 500);
    };

    const handleFindDFS = () => {
        if (!startNode) {
            alert('Select a start node!');
            return;
        }
        const { visited, path } = runDFS(nodes, edges, startNode, endNode);
        setVisitedNodes(visited);
        setShortestPath(path);
        setDistances({});
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('DFS');
        sounds.path.play();
    };

    const handleStepDFS = () => {
        if (!startNode) {
            alert('Select a start node!');
            return;
        }
        const { visited, path, steps } = runDFS(nodes, edges, startNode, endNode, true);
        setVisitedNodes(visited);
        setShortestPath([]);
        setDistances({});
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('DFS');
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setVisitedNodes(steps[stepIndex].visited);
                setShortestPath(stepIndex === steps.length - 1 ? path : []);
                stepIndex++;
            } else {
                clearInterval(interval);
                setShortestPath(path);
                sounds.path.play();
            }
        }, 500);
    };

    const handleTopologicalSort = () => {
        const { order, steps } = runTopologicalSort(nodes, edges, true);
        setTopoOrder(order);
        setVisitedNodes([]);
        setShortestPath([]);
        setDistances({});
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('Topological Sort');
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setTopoOrder(steps[stepIndex].stack);
                stepIndex++;
            } else {
                clearInterval(interval);
                setTopoOrder(order);
                sounds.path.play();
            }
        }, 500);
    };

    const handlePrims = () => {
        if (!startNode) {
            alert('Select a start node for Prim\'s algorithm!');
            return;
        }
        if (nodes.length < 2 || edges.length === 0) {
            alert('Graph must have at least 2 nodes and 1 edge!');
            return;
        }
        const { mstEdges, steps } = runPrims(nodes, edges, startNode, true);
        setMstEdges(mstEdges);
        setShortestPath([]);
        setVisitedNodes([]);
        setDistances({});
        setTopoOrder([]);
        setSccs([]);
        setAlgorithm("Prim's");
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setMstEdges(steps[stepIndex].mstEdges.map(edge => ({ ...edge, isIntermediate: true })));
                setVisitedNodes(steps[stepIndex].visited);
                stepIndex++;
            } else {
                clearInterval(interval);
                setMstEdges(mstEdges.map(edge => ({ ...edge, isIntermediate: false })));
                setVisitedNodes(nodes.map(n => n.id));
                sounds.path.play();
            }
        }, 500);
    };

    const handleKruskals = () => {
        if (nodes.length < 2 || edges.length === 0) {
            alert('Graph must have at least 2 nodes and 1 edge!');
            return;
        }
        const { mstEdges, steps } = runKruskals(nodes, edges, true);
        setMstEdges(mstEdges);
        setShortestPath([]);
        setVisitedNodes([]);
        setDistances({});
        setTopoOrder([]);
        setSccs([]);
        setAlgorithm("Kruskal's");
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setMstEdges(steps[stepIndex].mstEdges.map(edge => ({ ...edge, isIntermediate: true })));
                const currentNodes = new Set();
                steps[stepIndex].mstEdges.forEach(edge => {
                    currentNodes.add(edge.start);
                    currentNodes.add(edge.end);
                });
                setVisitedNodes([...currentNodes]);
                stepIndex++;
            } else {
                clearInterval(interval);
                setMstEdges(mstEdges.map(edge => ({ ...edge, isIntermediate: false })));
                setVisitedNodes(nodes.map(n => n.id));
                sounds.path.play();
            }
        }, 500);
    };

    const handleTarjans = () => {
        const { sccs, steps } = runTarjans(nodes, edges, true);
        setSccs(sccs);
        setMstEdges([]);
        setShortestPath([]);
        setVisitedNodes([]);
        setDistances({});
        setTopoOrder([]);
        setAlgorithm("Tarjan's");
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setSccs(steps[stepIndex].sccs);
                stepIndex++;
            } else {
                clearInterval(interval);
                setSccs(sccs);
                sounds.path.play();
            }
        }, 500);
    };

    const handleBellmanFord = () => {
        if (!startNode || !endNode) {
            alert('Select both start and end nodes!');
            return;
        }
        const { distances, path, steps } = runBellmanFord(nodes, edges, startNode, endNode, true);
        setDistances(distances);
        setShortestPath(path);
        setVisitedNodes([]);
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setAlgorithm('Bellman-Ford');
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setDistances(steps[stepIndex].distances);
                setShortestPath(stepIndex === steps.length - 1 ? path : []);
                stepIndex++;
            } else {
                clearInterval(interval);
                setShortestPath(path);
                sounds.path.play();
            }
        }, 500);
    };

    const startGame = (mode) => {
        if (nodes.length < 2) {
            alert('Add at least 2 nodes to start a game!');
            return;
        }
        const start = nodes[0].id;
        const end = nodes[nodes.length - 1].id;
        setGameMode(mode);
        setGameState('playing');
        setStartNode(start);
        setEndNode(end);
        setTimer(0);
        setIsTimerRunning(true);
        setUserPath([]);
        setScore(0);
        setShortestPath([]);
        setDistances({});
        setVisitedNodes([]);
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setPathWeight(0);
        setAlgorithm(null);
        alert(mode === 'shortPath'
            ? `Short Path Game Started: Find a path from Node ${start} to Node ${end} with total weight < 50!`
            : `Connect All Game Started: Connect all ${nodes.length} nodes from Node ${start} to Node ${end}!`);
    };

    const submitUserPath = () => {
        if (gameState !== 'playing' || !gameMode || userPath.length < 2) {
            alert('Please select a valid path with at least two nodes!');
            return;
        }
        if (userPath[0] !== startNode || userPath[userPath.length - 1] !== endNode) {
            alert(`Path must start at Node ${startNode} and end at Node ${endNode}!`);
            return;
        }

        const { distances, path } = runDijkstra(nodes, edges, startNode, endNode);
        setDistances(distances);
        setShortestPath(path);
        setIsTimerRunning(false);
        setAlgorithm('Dijkstra');

        let bonus = 0;
        if (gameMode === 'shortPath') {
            if (pathWeight < 50) {
                bonus = 100 + Math.max(0, 50 - pathWeight);
                alert(`Short Path Game Won! Your path weight: ${pathWeight} < 50. Score: ${score + bonus - timer}`);
            } else {
                alert(`Short Path Game Lost! Your path weight: ${pathWeight} >= 50. Optimal weight: ${distances[endNode]}`);
            }
        } else if (gameMode === 'connectAll') {
            const allNodesIncluded = nodes.every(node => userPath.includes(node.id));
            if (allNodesIncluded && userPath.length === nodes.length) {
                bonus = 150 + Math.max(0, 100 - pathWeight);
                alert(`Connect All Game Won! All ${nodes.length} nodes connected. Score: ${score + bonus - timer}`);
            } else {
                alert(`Connect All Game Lost! Missing: ${nodes.filter(n => !userPath.includes(n.id)).map(n => n.id).join(', ')}`);
            }
        }

        const finalScore = score + bonus - timer;
        setScore(finalScore);
        setLeaderboard(prev => {
            const newEntry = { score: finalScore, time: timer, date: new Date().toLocaleString() };
            const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
            return updated;
        });
        setGameState('completed');
    };

    const clearGraph = () => {
        if (window.confirm('Are you sure you want to clear the graph?')) {
            setNodes([]);
            setEdges([]);
            setShortestPath([]);
            setDistances({});
            setVisitedNodes([]);
            setTopoOrder([]);
            setMstEdges([]);
            setSccs([]);
            setStartNode(null);
            setEndNode(null);
            setWeight('');
            setScore(0);
            setTimer(0);
            setIsTimerRunning(false);
            setGameMode(null);
            setUserPath([]);
            setGameState('setup');
            setHistory([]);
            setHistoryIndex(-1);
            setPathWeight(0);
            setAlgorithm(null);
        }
    };

    const resetVisualization = () => {
        setShortestPath([]);
        setDistances({});
        setVisitedNodes([]);
        setTopoOrder([]);
        setMstEdges([]);
        setSccs([]);
        setPathWeight(0);
        setAlgorithm(null);
    };

    const deleteNode = (nodeId) => {
        if (gameState === 'playing') return;
        saveState();
        setNodes(nodes.filter(n => n.id !== nodeId));
        setEdges(edges.filter(e => e.start !== nodeId && e.end !== nodeId));
        if (startNode === nodeId) setStartNode(null);
        if (endNode === nodeId) setEndNode(null);
    };

    const deleteEdge = (edgeIndex) => {
        if (gameState === 'playing') return;
        saveState();
        setEdges(edges.filter((_, i) => i !== edgeIndex));
    };

    const saveGraph = () => {
        const graphData = { nodes, edges };
        const blob = new Blob([JSON.stringify(graphData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'graph.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const loadGraph = (e) => {
        if (gameState === 'playing') return;
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            setNodes(data.nodes);
            setEdges(data.edges);
            setShortestPath([]);
            setDistances({});
            setVisitedNodes([]);
            setTopoOrder([]);
            setMstEdges([]);
            setSccs([]);
            saveState();
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const getGraphStats = () => ({
        nodeCount: nodes.length,
        edgeCount: edges.length,
        avgDegree: nodes.length ? (2 * edges.length) / nodes.length : 0,
    });

    return (
        <div className={`graph-container ${theme}`}>
            {tooltip && (
                <div className="tooltip" style={{ position: 'absolute', left: tooltip.x, top: tooltip.y }}>
                    {tooltip.content}
                </div>
            )}
            <header className="graph-header">
                <h1>Graph Algorithm Visualizer</h1>
                <p>Score: {score} | Time: {timer}s | State: {gameState.toUpperCase()}
                    {gameMode && ` | Mode: ${gameMode === 'shortPath' ? 'Short Path' : 'Connect All'} ${gameState === 'playing' ? `(Node ${startNode} → Node ${endNode})` : ''}`}
                </p>
            </header>

            <Toolbar
                mode={mode}
                setMode={setMode}
                gameState={gameState}
                onFindDijkstra={handleFindDijkstra}
                onStepDijkstra={handleStepDijkstra}
                onFindBFS={handleFindBFS}
                onStepBFS={handleStepBFS}
                onFindDFS={handleFindDFS}
                onStepDFS={handleStepDFS}
                onTopoSort={handleTopologicalSort}
                onPrims={handlePrims}
                onKruskals={handleKruskals}
                onTarjans={handleTarjans}
                onBellmanFord={handleBellmanFord}
                onStartGame={startGame}
                onSave={saveGraph}
                onLoad={() => fileInputRef.current.click()}
                onReset={resetVisualization}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
            />
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="theme-select">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="neon">Neon</option>
            </select>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={loadGraph} accept=".json" />

            <Controls
                gameState={gameState}
                mode={mode}
                startNode={startNode}
                setStartNode={setStartNode}
                endNode={endNode}
                setEndNode={setEndNode}
                weight={weight}
                setWeight={setWeight}
                nodes={nodes}
                onCreateEdge={handleEdgeCreation}
                onClear={clearGraph}
                userPath={userPath}
                gameMode={gameMode}
                algorithm={algorithm}
            />

            <div className="stats">
                <p>Nodes: {getGraphStats().nodeCount} | Edges: {getGraphStats().edgeCount} | Avg Degree: {getGraphStats().avgDegree.toFixed(2)}
                    {gameState === 'playing' && ` | Current Path Weight: ${pathWeight >= Infinity ? '∞' : pathWeight}`}
                </p>
            </div>

            <ResultsPanel
                distances={distances}
                startNode={startNode}
                shortestPath={shortestPath}
                visitedNodes={visitedNodes}
                topoOrder={topoOrder}
                mstEdges={mstEdges}
                sccs={sccs}
                userPath={userPath}
                gameState={gameState}
                gameMode={gameMode}
                leaderboard={leaderboard}
                pathWeight={pathWeight}
                algorithm={algorithm}
            />

            <svg
                width="100%"
                height="600"
                className="graph-canvas"
                onClick={handleCanvasClick}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
            >
                <defs>
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#0ff', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#f0f', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                {edges.map((edge, index) => {
                    const startNode = nodes.find(n => n.id === edge.start);
                    const endNode = nodes.find(n => n.id === edge.end);
                    if (!startNode || !endNode) return null;
                    const isInShortestPath = shortestPath.includes(edge.start) && shortestPath.includes(edge.end) &&
                        Math.abs(shortestPath.indexOf(edge.start) - shortestPath.indexOf(edge.end)) === 1;
                    const isInUserPath = userPath.includes(edge.start) && userPath.includes(edge.end) &&
                        Math.abs(userPath.indexOf(edge.start) - userPath.indexOf(edge.end)) === 1;
                    const isInMST = mstEdges.some(e => (e.start === edge.start && e.end === edge.end) || (e.start === edge.end && e.end === edge.start));
                    const isIntermediate = isInMST && mstEdges.find(e => (e.start === edge.start && e.end === edge.end) || (e.start === edge.end && e.end === edge.start)).isIntermediate;
                    return (
                        <g key={index} className={mode === 'delete' ? 'deletable' : ''} 
                           onClick={() => mode === 'delete' && gameState !== 'playing' && deleteEdge(index)}
                           onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, content: `Weight: ${edge.weight}` })}
                           onMouseLeave={() => setTooltip(null)}>
                            <line
                                x1={startNode.x}
                                y1={startNode.y}
                                x2={endNode.x}
                                y2={endNode.y}
                                className={isInShortestPath ? 'path-edge' : isInUserPath ? 'user-edge' : isInMST ? (isIntermediate ? 'mst-edge-intermediate' : 'mst-edge-final') : 'normal-edge'}
                            />
                            <text x={(startNode.x + endNode.x) / 2} y={(startNode.y + endNode.y) / 2 - 10} className="weight-label">{edge.weight}</text>
                        </g>
                    );
                })}
                {nodes.map(node => {
                    const inSCC = sccs.some(scc => scc.includes(node.id));
                    return (
                        <g key={node.id} className={mode === 'delete' ? 'deletable' : ''} 
                           onClick={() => gameState === 'playing' ? handleNodeClick(node.id) : mode === 'delete' && deleteNode(node.id)}
                           onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, content: `Node ${node.id}` })}
                           onMouseLeave={() => setTooltip(null)}>
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={20}
                                className={`node ${node.id === startNode ? 'start' : ''} ${node.id === endNode ? 'end' : ''} ${userPath.includes(node.id) ? 'user-selected' : ''} ${visitedNodes.includes(node.id) && !shortestPath.includes(node.id) ? 'visited' : ''} ${inSCC ? 'scc-node' : ''}`}
                                onMouseDown={() => handleDragStart(node)}
                            />
                            <text x={node.x} y={node.y + 5} className="node-label">{node.id}</text>
                        </g>
                    );
                })}
            </svg>
            {gameState === 'playing' && <button onClick={submitUserPath} className="primary floating-submit">Submit Path</button>}
        </div>
    );
};

export default GraphVisualizer;