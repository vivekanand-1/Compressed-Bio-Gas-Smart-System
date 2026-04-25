import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '250px',
    borderRadius: '8px',
    marginTop: '8px',
    border: '1px solid rgba(0, 255, 136, 0.3)'
};

const center = { lat: 28.6139, lng: 77.2090 }; 

const mapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#020406" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3a5360" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#00ff88" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#0a131b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#010203" }] }
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', wasteQuantity: '' });
  const [markerPos, setMarkerPos] = useState(null);
  const [loading, setLoading] = useState(false);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const fetchSuppliers = () => {
    fetch('http://localhost:5000/api/suppliers')
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(err => console.error("Fetch Error:", err));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch('http://localhost:5000/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lat: markerPos?.lat, lng: markerPos?.lng })
    })
      .then(res => res.json())
      .then(() => {
        setForm({ name: '', location: '', wasteQuantity: '' });
        setMarkerPos(null);
        fetchSuppliers();
        setLoading(false);
      })
      .catch(err => {
        console.error("Post Error:", err);
        setLoading(false);
      });
  };

  return (
    <div className="standard-page">
      <h1 className="page-title">Waste Node / Suppliers Management</h1>

      <div className="grid-2">
        <div className="card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Onboard New Supplier</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Supplier Name</label>
              <input 
                required
                type="text" 
                className="input-field" 
                placeholder="E.g. Ramesh Singh"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Location (Node)</label>
              <input 
                required
                type="text" 
                className="input-field" 
                placeholder="E.g. Village C"
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Est. Waste Quantity (Tons/Month)</label>
              <input 
                required
                type="number" 
                className="input-field" 
                placeholder="E.g. 50"
                value={form.wasteQuantity}
                onChange={e => setForm({...form, wasteQuantity: e.target.value})}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Mark Exact Coordinates</label>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{markerPos ? `Pinned @ Lat: ${markerPos.lat.toFixed(4)}, Lng: ${markerPos.lng.toFixed(4)}` : "Click on the map to set location"}</div>
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={center}
                      zoom={10}
                      onClick={(e) => setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                      options={{ styles: mapDarkStyle, disableDefaultUI: true }}
                  >
                      {markerPos && (
                          <Marker 
                              position={markerPos} 
                              icon={{
                                  path: window.google.maps.SymbolPath.CIRCLE,
                                  fillColor: '#00ff88',
                                  fillOpacity: 1,
                                  strokeColor: '#fff',
                                  strokeWeight: 2,
                                  scale: 6,
                              }}
                          />
                      )}
                  </GoogleMap>
              </LoadScript>
            </div>
            <button type="submit" className="btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <Plus size={18} />
              {loading ? "Registering..." : "Register Supplier"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Registered Suppliers</h2>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location Node</th>
                  <th>Waste (Tons)</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No suppliers found.</td></tr>
                ) : (
                  suppliers.map(sup => (
                    <tr key={sup.id}>
                      <td>#{sup.id}</td>
                      <td style={{ fontWeight: 500 }}>{sup.name}</td>
                      <td>{sup.location}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{sup.wasteQuantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
