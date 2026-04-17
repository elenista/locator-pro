import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import './style.css';

// Fix Leaflet Icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const App = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLocationId, setActiveLocationId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const markerRefs = useRef({});

    useEffect(() => {
        fetch(`${lpData.root_url}wp/v2/location`)
            .then(res => res.json())
            .then(data => {
                setLocations(data);
                setLoading(false);
            });
    }, []);

    const activeLocation = useMemo(() => 
        locations.find(l => l.id === activeLocationId), 
    [locations, activeLocationId]);

    const handleLocationSelect = (locId) => {
        setActiveLocationId(locId);
        if (markerRefs.current[locId]) {
            markerRefs.current[locId].openPopup();
        }
    };

    if (loading) return <div className="lp-loading">Loading map...</div>;

    return (
        <div className="lp-plugin-container" style={{ position: 'relative' }}>
            <button 
                className="lp-sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? '✕ Close' : '☰ View List'}
            </button>

            <Sidebar 
                locations={locations}
                activeLocationId={activeLocationId}
                onLocationClick={(loc) => handleLocationSelect(loc.id)}
                isOpen={isSidebarOpen}
            />

            <div className="lp-map-wrapper">
                <MapDisplay 
                    locations={locations}
                    activeLocation={activeLocation}
                    markerRefs={markerRefs}
                    onMarkerClick={handleLocationSelect}
                />
            </div>
        </div>
    );
};

const rootElement = document.getElementById('lp-react-root');
if (rootElement) {
    createRoot(rootElement).render(<App />);
}