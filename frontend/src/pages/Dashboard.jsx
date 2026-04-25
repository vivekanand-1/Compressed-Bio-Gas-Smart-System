import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import LiveMap from '../components/LiveMap';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [simDelay, setSimDelay] = useState(15);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const navigate = useNavigate();

  const fetchNetworkState = () => {
    fetch('http://localhost:5000/api/analytics/network')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to fetch dashboard data:", err));
  };

  useEffect(() => {
    if(!localStorage.getItem('token')) {
        navigate('/login');
        return;
    }
    fetchNetworkState();
    
    // Poll for updates every 10s to feel "live"
    const interval = setInterval(fetchNetworkState, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleInjectTraffic = async () => {
      if (!selectedEdge) return;
      setIsSimulating(true);
      
      try {
          await fetch('http://localhost:5000/api/optimize/update-edge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  start: selectedEdge.start, 
                  end: selectedEdge.end, 
                  addedTime: parseFloat(simDelay), 
                  addedDistance: 0 
              })
          });
          
          fetchNetworkState(); 
          setSelectedEdge(null);
      } catch (e) {
          console.error("Traffic injection failed", e);
      } finally {
          setIsSimulating(false);
      }
  };

  if (!data) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
            <div className="hud-title" style={{ color: 'var(--primary)', textShadow: '0 0 20px var(--primary)', fontSize: '32px'}}>STABILIZING GRID...</div>
            <div className="hud-subtitle" style={{ marginTop: '16px'}}>Syncing Telematic Feeds</div>
        </div>
    );
  }

  const totalVehicles = data.vehicles?.length || 0;
  const activeVehicles = data.vehicles?.filter(v => v.status === 'en_route').length || 0;
  
  const collectedNodes = Object.values(data.nodes).filter(n => n.type === 'village' && n.status === 'collected').length;
  const pendingNodes = Object.values(data.nodes).filter(n => n.type === 'village' && n.status === 'uncollected').length;
  const totalNetworkNodes = collectedNodes + pendingNodes || 1; // prevent / 0

  const yieldData = [
      { name: 'Collected', value: collectedNodes },
      { name: 'Pending', value: pendingNodes }
  ];

  const fleetData = [
      { name: 'Active', value: activeVehicles },
      { name: 'Idle', value: totalVehicles > activeVehicles ? totalVehicles - activeVehicles : 0 }
  ];

  return (
    <>
      <div className="map-full-bg">
         <LiveMap 
            nodes={data.nodes} 
            edges={data.edges} 
            vehicles={data.vehicles} 
            onEdgeClick={(start, end) => setSelectedEdge({ start, end })} 
         />
      </div>

      <div className="dashboard-overlays">
          {/* Left Command Panel */}
          <div className="hud-panel" style={{ width: '340px' }}>
              <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)' }}></div>
                 <div className="hud-title">System Uplink</div>
                 <div className="hud-subtitle">v 2.0 Operational Node</div>
                 <div className="badge-neon" style={{ marginTop: '16px' }}>Network Synchronized</div>
              </div>
              
              {/* Radial Data Widgets */}
              <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px' }}>
                      <div className="stat-label-neon" style={{ fontSize: '11px', textAlign: 'center' }}>Yield Core</div>
                      <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={yieldData} innerRadius={35} outerRadius={45} dataKey="value" stroke="none" cornerRadius={4}>
                                      <Cell fill="var(--primary)" />
                                      <Cell fill="rgba(255,255,255,0.05)" />
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Orbitron', fontSize: '16px', fontWeight: '700', color: '#fff', textShadow: '0 0 10px var(--primary)' }}>
                              {Math.round((collectedNodes / totalNetworkNodes) * 100)}%
                          </div>
                      </div>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-muted)' }}>{collectedNodes} / {totalNetworkNodes} Collected</div>
                  </div>

                  <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px' }}>
                      <div className="stat-label-neon" style={{ fontSize: '11px', textAlign: 'center' }}>Active Fleet</div>
                      <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={fleetData} innerRadius={35} outerRadius={45} dataKey="value" stroke="none" cornerRadius={4}>
                                      <Cell fill="var(--secondary)" />
                                      <Cell fill="rgba(255,255,255,0.05)" />
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Orbitron', fontSize: '16px', fontWeight: '700', color: '#fff', textShadow: '0 0 10px var(--secondary)' }}>
                              {activeVehicles}
                          </div>
                      </div>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-muted)' }}>of {totalVehicles} units</div>
                  </div>
              </div>

              {/* Dynamic Sim Engine Panel */}
              {selectedEdge ? (
                  <div className="glass-panel" style={{ border: '1px solid var(--danger)', boxShadow: 'inset 0 0 20px rgba(255,0,0,0.1)' }}>
                      <div className="stat-label-neon" style={{ color: 'var(--danger)', marginBottom: '16px' }}>Simulator: Traffic Intervention</div>
                      <div style={{ fontSize: '13px', fontFamily: 'Rajdhani', color: 'var(--text-main)', marginBottom: '16px' }}>
                          Target Vector: <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{selectedEdge.start} &rarr; {selectedEdge.end}</span>
                      </div>
                      
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Apply Resistance (Minutes Delay)</label>
                      <input 
                          type="range" 
                          min="0" max="60" 
                          value={simDelay} 
                          onChange={(e) => setSimDelay(e.target.value)}
                          style={{ width: '100%', margin: '12px 0' }}
                      />
                      <div style={{ textAlign: 'right', fontFamily: 'Orbitron', color: 'var(--primary)', marginBottom: '12px' }}>+{simDelay} min</div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn" style={{ flex: 1, borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }} onClick={() => setSelectedEdge(null)}>Abort</button>
                          <button className="btn" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleInjectTraffic}>
                              {isSimulating ? 'Injecting...' : 'Override Node'}
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="glass-panel" style={{ opacity: 0.7 }}>
                      <div className="stat-label-neon" style={{ color: 'var(--warning)' }}>Simulator Tools</div>
                      <p style={{ fontSize: '14px', fontFamily: 'Rajdhani', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                         Awaiting manual override... Click glowing vector paths on the grid to inject localized traffic delays.
                      </p>
                  </div>
              )}
          </div>

          {/* Right Predictor Panel */}
          <div className="hud-panel" style={{ width: '340px' }}>
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--secondary)', boxShadow: '0 0 15px var(--secondary)' }}></div>
                 <div className="hud-title" style={{ textShadow: '0 0 10px var(--secondary)'}}>AI Predictor</div>
                 <div className="hud-subtitle" style={{ color: 'var(--secondary)'}}>Syncing Live Demand Matrix</div>
              </div>

              <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 220px)' }}>
                 <div className="stat-label-neon" style={{ marginBottom: '12px' }}>Structural Analysis</div>
                 {Object.keys(data.nodes).filter(k => data.nodes[k].type === 'village').map(k => {
                      const node = data.nodes[k];
                      return (
                          <div key={k} style={{ 
                               padding: '12px', 
                               background: 'rgba(0, 20, 10, 0.5)', 
                               borderRadius: '4px', 
                               borderLeft: `3px solid ${node.predictedDemand === 'High' ? 'var(--danger)' : node.predictedDemand === 'Medium' ? 'var(--warning)' : 'var(--primary)'}`, 
                               display: 'flex', 
                               justifyContent: 'space-between', 
                               alignItems: 'center',
                               boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                               transition: 'all 0.3s ease',
                               cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-5px)'; e.currentTarget.style.background = 'rgba(0,40,20,0.6)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'rgba(0,20,10,0.5)'; }}
                          >
                              <div>
                                  <div style={{ fontFamily: 'Orbitron', fontSize: '14px', color: 'var(--text-main)' }}>{k}</div>
                                  <div style={{ fontSize: '11px', fontFamily: 'Rajdhani', color: 'var(--text-muted)', marginTop: '4px' }}>STATUS: {node.status.toUpperCase()}</div>
                              </div>
                              <div className={`badge-neon ${node.predictedDemand === 'High' ? 'danger' : node.predictedDemand === 'Medium' ? 'warning' : ''}`}>
                                 {node.predictedDemand}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
    </>
  );
}
