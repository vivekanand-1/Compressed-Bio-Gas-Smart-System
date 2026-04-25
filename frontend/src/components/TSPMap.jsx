import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
}; // New Delhi Plant roughly

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; 

const TSPMap = ({ locations = [], optimizedOrder = [], onMapClick }) => {
    const [osrmPath, setOsrmPath] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Fetch geometric polyline via Free OSRM based on exact backend algorithm sequence
    useEffect(() => {
        if (!mapLoaded || optimizedOrder.length < 2) {
             if (optimizedOrder.length < 2) setOsrmPath(null);
             return;
        }

        const fetchRouteGeometry = async () => {
             try {
                 const coordsString = optimizedOrder.map(loc => `${loc.lng},${loc.lat}`).join(';');
                 const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
                 const data = await response.json();

                 if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                     const polylinePoints = data.routes[0].geometry.coordinates.map(coord => ({
                         lat: coord[1],
                         lng: coord[0]
                     }));
                     setOsrmPath(polylinePoints);
                 } else {
                     console.error("OSRM Failed to return geometry:", data.code);
                     setOsrmPath(null);
                 }
             } catch (error) {
                 console.error("Failed fetching OSRM TSP Geometry:", error);
                 setOsrmPath(null);
             }
         };

         fetchRouteGeometry();
    }, [optimizedOrder, mapLoaded]);

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={locations.length > 0 ? { lat: locations[locations.length-1].lat, lng: locations[locations.length-1].lng } : defaultCenter}
                zoom={11}
                onLoad={() => setMapLoaded(true)}
                onClick={(e) => {
                     if (onMapClick) onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }}
                options={{
                    gestureHandling: 'greedy',
                    disableDefaultUI: false
                }}
            >
                {/* Render Markers for locations not yet routed */}
                {!osrmPath && locations.map((loc, idx) => (
                     <Marker 
                        key={loc.id || idx}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        label={{
                            text: String(idx + 1),
                            color: '#000',
                            fontWeight: 'bold'
                        }}
                     />
                ))}

                {/* Render the full optimal path using Native OSRM Polyline Logic */}
                {osrmPath && (
                    <Polyline 
                       path={osrmPath} 
                       options={{
                           strokeColor: "#00ff88", // Glow neon green matching theme
                           strokeWeight: 6,
                           strokeOpacity: 0.8
                       }}
                    />
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default React.memo(TSPMap);
