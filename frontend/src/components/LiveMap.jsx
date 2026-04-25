import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0px'
};

const center = {
    lat: 28.6139,
    lng: 77.2090
}; 

// Deep Dark Neo-Grid Theme
const mapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#020406" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3a5360" }] },
  {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#00ff88" }]
  },
  {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3a5360" }],
  },
  {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#030a11" }],
  },
  {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#0a131b" }],
  },
  {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#0a131b" }],
  },
  {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#101e29" }],
  },
  {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#101e29" }],
  },
  {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#010203" }],
  },
];

const LiveMap = ({ nodes = {}, edges = {}, vehicles = [], onEdgeClick }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [realRoadPaths, setRealRoadPaths] = useState({});
    const requestedKeys = useRef(new Set());
    const polylineRefs = useRef({});

    // Animation Loop for Flowing Energy / Supply Packets
    useEffect(() => {
        if (!mapLoaded || !window.google) return;
        
        let count = 0;
        const interval = window.setInterval(() => {
            count = (count + 1) % 100;
            const icons = [{
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    strokeColor: '#00ff88',
                    fillColor: '#00ff88',
                    fillOpacity: 1
                },
                offset: count + '%'
            }];
            
            Object.values(polylineRefs.current).forEach(lineObj => {
                 if (lineObj && lineObj.instance && lineObj.instance.set) {
                     // For congested paths, change the flow icon to red warning style
                     if (lineObj.isCongested) {
                         icons[0].icon.strokeColor = '#ff003c';
                         icons[0].icon.fillColor = '#ff003c';
                     } else {
                         icons[0].icon.strokeColor = '#00ff88';
                         icons[0].icon.fillColor = '#00ff88';
                     }
                     lineObj.instance.set('icons', icons);
                 }
            });
        }, 100); // 10 ticks per sec

        return () => window.clearInterval(interval);
    }, [mapLoaded]);

    const markers = useMemo(() => {
        return Object.keys(nodes).map(key => ({
            id: key,
            ...nodes[key]
        }));
    }, [nodes]);

    useEffect(() => {
        if (!mapLoaded || !window.google) return;

        const uniqueEdges = [];

        for (const start in edges) {
            for (const end in edges[start]) {
                const edgeKey = start < end ? `${start}-${end}` : `${end}-${start}`;
                if (!requestedKeys.current.has(edgeKey) && nodes[start] && nodes[end]) {
                    uniqueEdges.push({ edgeKey, start, end });
                    requestedKeys.current.add(edgeKey);
                }
            }
        }

        if (uniqueEdges.length === 0) return;

        const fetchRoutes = async () => {
            for (const item of uniqueEdges) {
                const { edgeKey, start, end } = item;
                try {
                    await new Promise(r => setTimeout(r, 400));

                    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${nodes[start].lng},${nodes[start].lat};${nodes[end].lng},${nodes[end].lat}?overview=full&geometries=geojson`);
                    const data = await response.json();

                    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                        const path = data.routes[0].geometry.coordinates.map(coord => ({
                            lat: coord[1],
                            lng: coord[0]
                        }));
                        setRealRoadPaths(prev => ({ ...prev, [edgeKey]: path }));
                    } else {
                        throw new Error(data.code || "Unknown OSRM Error");
                    }
                } catch (e) {
                    console.error(`Failed resolving true road path for ${edgeKey}:`, e);
                    requestedKeys.current.delete(edgeKey);
                }
            }
        };

        fetchRoutes();
    }, [mapLoaded, edges, nodes]);

    // OSRM polylines
    const polylines = useMemo(() => {
        const lines = [];
        const drawn = new Set();

        for (let start in edges) {
            for (let end in edges[start]) {
                const edgeKey = start < end ? `${start}-${end}` : `${end}-${start}`;
                if (drawn.has(edgeKey)) continue;

                if (nodes[start] && nodes[end] && realRoadPaths[edgeKey]) {
                    lines.push({
                        id: edgeKey,
                        path: realRoadPaths[edgeKey],
                        isCongested: edges[start][end].isCongested === true
                    });
                }
                drawn.add(edgeKey);
            }
        }
        return lines;
    }, [edges, nodes, realRoadPaths]);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const getEnergyMarkerIcon = (type, status) => {
        if (!window.google) return null;
        
        let color = '#00ff88';
        if (type === 'plant') color = '#00e5ff';
        else if (status !== 'collected') color = '#ffb800';

        return {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 1.5,
            scale: type === 'plant' ? 8 : 6,
        };
    };

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={11}
                onLoad={() => setMapLoaded(true)}
                options={{
                    styles: mapDarkStyle,
                    gestureHandling: 'greedy',
                    disableDefaultUI: true 
                }}
            >
                {/* Render Polylines */}
                {polylines.map(line => {
                    const [start, end] = line.id.split('-');
                    return (
                        <Polyline
                            key={line.id}
                            path={line.path}
                            onLoad={(instance) => { polylineRefs.current[line.id] = { instance, isCongested: line.isCongested }; }}
                            onUnmount={() => { delete polylineRefs.current[line.id]; }}
                            onClick={() => {
                                if (onEdgeClick) onEdgeClick(start, end);
                            }}
                            options={{
                                strokeColor: line.isCongested ? 'rgba(255, 0, 60, 0.6)' : 'rgba(0, 255, 136, 0.4)',
                                strokeOpacity: 1,
                                strokeWeight: line.isCongested ? 5 : 3,
                                clickable: !!onEdgeClick,
                            }}
                        />
                    )
                })}

                {/* Render Nodes */}
                {mapLoaded && markers.map(loc => (
                    <Marker
                        key={loc.id}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        label={{
                            text: loc.id,
                            color: '#00ff88',
                            fontSize: '12px',
                            fontFamily: 'Orbitron',
                            fontWeight: '600',
                            className: 'map-label-neon'
                        }}
                        icon={getEnergyMarkerIcon(loc.type, loc.status)}
                    />
                ))}

                {/* Render Active Vehicles */}
                {mapLoaded && vehicles.map(v => {
                    const nodeCoord = nodes[v.currentLocation];
                    if (!nodeCoord) return null;

                    return (
                        <Marker
                            key={v.id}
                            position={{ lat: nodeCoord.lat, lng: nodeCoord.lng }}
                            icon={{
                                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 6,
                                fillColor: '#ffffff',
                                fillOpacity: 1,
                                strokeColor: '#00cc6a',
                                strokeWeight: 2,
                            }}
                        />
                    )
                })}
            </GoogleMap>
        </LoadScript>
    );
};

export default React.memo(LiveMap);
