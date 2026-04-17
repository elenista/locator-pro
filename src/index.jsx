import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './style.css';

// Fix for default Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Helper component to handle auto-fitting and manual panning
 */
function MapController({ locations, activeLocation }) {
    const map = useMap();

    // Initial fit bounds when data loads
    useEffect(() => {
        if (locations.length > 0 && !activeLocation) {
            const bounds = L.latLngBounds(locations.map(loc => [
                parseFloat(loc.latitude), 
                parseFloat(loc.longitude)
            ]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);

    // Pan to active location when selected from sidebar
    useEffect(() => {
        if (activeLocation) {
            map.panTo(
              [parseFloat(activeLocation.latitude), parseFloat(activeLocation.longitude)],
              { animate: true, duration: 1 } // Smooth transition
            );
        }
    }, [activeLocation, map]);

    return null;
}

const App = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLocationId, setActiveLocationId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Store refs to all markers to open popups programmatically
    const markerRefs = useRef({});

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch(`${lpData.root_url}wp/v2/location`);
                const data = await response.json();
                setLocations(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching locations:', err);
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const handleSidebarClick = (loc) => {
        setActiveLocationId(loc.id);
        
        // Open the marker popup programmatically
        const marker = markerRefs.current[loc.id];
        if (marker) {
            marker.openPopup();
        }
    };

    if (loading) return <div className="lp-loading">Loading Map...</div>;

    const activeLocation = locations.find(l => l.id === activeLocationId);

    return (
        <div className="lp-plugin-container" style={{ position: 'relative' }}>
            
            {/* Toggle Button */}
            <button 
                className="lp-sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? '✕ Close List' : '☰ Open List'}
            </button>

            {/* Sidebar List */}
            <div className={`lp-sidebar ${!isSidebarOpen ? 'is-collapsed' : ''}`}>
                <div className="lp-sidebar-header" style={{ paddingTop: '50px' }}> {/* Space for button */}
                    <h3 style={{ margin: 0 }}>Our Locations</h3>
                </div>
                {locations.map(loc => (
                    <div 
                        key={loc.id} 
                        className={`lp-location-item ${activeLocationId === loc.id ? 'is-active' : ''}`}
                        onClick={() => handleSidebarClick(loc)}
                    >
                        <strong>{loc.title.rendered}</strong>
                    </div>
                ))}
            </div>

            {/* Map Area */}
            <div className="lp-map-wrapper">
                <MapContainer 
                    center={[37.9838, 23.7275]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    <MapController locations={locations} activeLocation={locations.find(l => l.id === activeLocationId)} />

                    {locations.map(loc => (
                        <Marker 
                            key={loc.id} 
                            position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                            ref={(el) => (markerRefs.current[loc.id] = el)}
                            eventHandlers={{
                                click: () => setActiveLocationId(loc.id)
                            }}
                        >
                            <Popup maxWidth={350}>
                                <div className="lp-popup-content">
                                    {loc.featured_image_url && (
                                        <img src={loc.featured_image_url} className="lp-popup-image" alt={loc.title.rendered} />
                                    )}
                                    <h4 className="lp-popup-title">{loc.title.rendered}</h4>
                                    <div className="lp-popup-description" dangerouslySetInnerHTML={{ __html: loc.content.rendered }} />
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

const rootElement = document.getElementById('lp-react-root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}