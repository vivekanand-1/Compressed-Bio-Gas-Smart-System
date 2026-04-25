import React, { useState } from 'react';
import { Search, MapPin, Route, Waypoints, Trash2, Leaf } from 'lucide-react';
import TSPMap from '../components/TSPMap';

export default function SmartRoutePlanner() {
    const [locations, setLocations] = useState([]);
    const [optimizedOrder, setOptimizedOrder] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    
    const [metrics, setMetrics] = useState({ totalDist: 0, totalTime: 0 });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        try {
            // Free OpenStreetMap Geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const newLoc = {
                    id: Date.now(),
                    name: data[0].display_name.split(',')[0],
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                setLocations([...locations, newLoc]);
                setOptimizedOrder([]); // clear previous routes
                setSearchQuery("");
            } else {
                alert("Location not found.");
            }
        } catch (e) {
            console.error("Search error:", e);
            alert("Error locating place.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleMapClick = (latLng) => {
        const newLoc = {
            id: Date.now(),
            name: `Dropped Pin (${latLng.lat.toFixed(3)}, ${latLng.lng.toFixed(3)})`,
            lat: latLng.lat,
            lng: latLng.lng
        };
        setLocations([...locations, newLoc]);
        setOptimizedOrder([]);
    };

    const removeLocation = (id) => {
        setLocations(locations.filter(loc => loc.id !== id));
        setOptimizedOrder([]);
    };

    const handleOptimize = async () => {
        if (locations.length < 2) {
            alert("Please add at least 2 locations to route.");
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/optimize/multi-stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locations })
            });
            const data = await res.json();
            
            if (data.success) {
                setOptimizedOrder(data.optimizedOrder);
                setMetrics({
                    totalDist: data.totalDistanceMt,
                    totalTime: data.totalDurationSec
                });
                setLoading(false);
            } else {
                setLoading(false);
                setTimeout(() => alert("Routing failed: " + (data.message || data.error || "Unknown backend error")), 100);
            }
        } catch (e) {
            console.error("Optimization failed:", e);
            setLoading(false);
            setTimeout(() => alert("API Connection Error. Ensure your Node JS backend is running out of terminal."), 100);
        }
    };

    return (
        <div className="standard-page dashboard-wrapper">
            <h1 className="page-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Route /> Smart TSP Route Planner
            </h1>

            <div className="grid-2" style={{ gridTemplateColumns: '350px 1fr' }}>
                
                {/* Control Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add Waypoints</h2>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <input 
                                type="text"
                                className="input-field"
                                placeholder="Search village or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn" onClick={handleSearch} disabled={searchLoading} style={{ padding: '0 16px' }}>
                                {searchLoading ? '...' : <Search size={18} />}
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            * You can also directly click on the map to drop pin locations.
                        </p>
                    </div>

                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Selected Locations</h2>
                            <span className="badge">{locations.length} nodes</span>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {locations.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>No locations added yet.</div>
                            ) : null}

                            {(optimizedOrder.length > 0 ? optimizedOrder : locations).map((loc, idx) => (
                                <div key={loc.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{loc.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</div>
                                        </div>
                                    </div>
                                    {!optimizedOrder.length && (
                                        <button className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '6px' }} onClick={() => removeLocation(loc.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {metrics.totalDist > 0 && (
                            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Optimal Route Metrics</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)' }}>
                                    Total Distance: {(metrics.totalDist / 1000).toFixed(2)} km
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--warning)' }}>
                                    Total Est. Time: {Math.round(metrics.totalTime / 60)} mins
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(16,185,129,0.3)', paddingTop: '8px' }}>
                                    <Leaf size={16} /> Est. Carbon Footprint: {((metrics.totalDist / 1000) * 0.15).toFixed(2)} kg CO₂
                                </div>
                            </div>
                        )}

                        <button className="btn" onClick={handleOptimize} disabled={loading || locations.length < 2} style={{ marginTop: '16px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <Waypoints size={18} />
                            {loading ? "Computing Paths..." : "Optimize Multi-Stop Route"}
                        </button>
                        {optimizedOrder.length > 0 && (
                            <button className="btn" onClick={() => { setOptimizedOrder([]); setMetrics({totalDist:0, totalTime: 0}); }} style={{ marginTop: '8px', width: '100%', background: 'transparent', border: '1px solid var(--border)' }}>
                                Reset Order / Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Map Display */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', height: '80vh' }}>
                    <TSPMap 
                        locations={locations} 
                        optimizedOrder={optimizedOrder} 
                        onMapClick={handleMapClick}
                    />
                </div>
                
            </div>
        </div>
    );
}
