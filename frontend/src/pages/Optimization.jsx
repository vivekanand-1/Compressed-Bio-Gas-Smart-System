import { useState, useEffect } from 'react';
import { Map, ArrowRight, Waypoints, Zap } from 'lucide-react';
import LiveMap from '../components/LiveMap';

export default function Optimization() {
  const [startNode, setStartNode] = useState('Plant');
  const [endNode, setEndNode] = useState('');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [fuelFactor, setFuelFactor] = useState(1.0);
  const [timeFactor, setTimeFactor] = useState(1.0);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState({ nodes: {}, edges: {}, vehicles: [] });

  const nodes = ['Plant', 'Village A', 'Village B', 'Village C', 'Village D', 'Village E', 'Village F', 'Village G'];

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics/network')
      .then(res => res.json())
      .then(data => setNetworkData(data))
      .catch(console.error);
  }, []);

  const handleOptimize = () => {
    setLoading(true);
    let url = `http://localhost:5000/api/optimize?start=${startNode}&algorithm=${algorithm}&fuel=${fuelFactor}&time=${timeFactor}`;
    if (endNode) url += `&end=${endNode}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Optimization failed:", err);
        setLoading(false);
      });
  };

  return (
    <div className="standard-page">
      <h1 className="page-title">Advanced Route Optimization</h1>
      
      <div className="grid-2">
        {/* Controls and Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Pathfinder Configuration</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Start Node</label>
                <select className="input-field" value={startNode} onChange={e => setStartNode(e.target.value)} style={{ backgroundColor: 'var(--bg-dark)' }}>
                  {nodes.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>End Node (Optional)</label>
                <select className="input-field" value={endNode} onChange={e => setEndNode(e.target.value)} style={{ backgroundColor: 'var(--bg-dark)' }}>
                  <option value="">All Destinations</option>
                  {nodes.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
               <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Algorithm</label>
                  <select className="input-field" value={algorithm} onChange={e => setAlgorithm(e.target.value)} style={{ backgroundColor: 'var(--bg-dark)' }}>
                    <option value="dijkstra">Dijkstra (Standard)</option>
                    <option value="astar">A* Search (Heuristic)</option>
                  </select>
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Cost Factors (Fuel : Time)</label>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" step="0.1" value={fuelFactor} onChange={e => setFuelFactor(e.target.value)} placeholder="Fuel" className="input-field" />
                    <input type="number" step="0.1" value={timeFactor} onChange={e => setTimeFactor(e.target.value)} placeholder="Time" className="input-field" />
                 </div>
               </div>
            </div>

            <button className="btn" onClick={handleOptimize} disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Waypoints size={18} />
              {loading ? "Calculating Optimal Routes..." : "Run Optimization"}
            </button>
          </div>

          {results && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                 <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Execution Results</h2>
                 <div className="badge warning"><Zap size={14} style={{ marginRight: '4px' }}/>{results.executionTimeMs} ms</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid var(--border)' }}>
                 Algorithm: <strong>{results.algorithmUsed}</strong> | Base Complexity: <strong>{results.timeComplexity}</strong>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Destination</th>
                      <th>Total Cost</th>
                      <th>Optimal Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((res, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{res.destination}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{res.cost === null ? '∞' : res.cost.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '12px' }}>
                            {res.path.map((node, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{node}</span>
                                {i < res.path.length - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Live Map Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', height: '650px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Network Topology</h2>
            <span className="badge">Geographic View</span>
          </div>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
             <LiveMap nodes={networkData.nodes} edges={networkData.edges} vehicles={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
