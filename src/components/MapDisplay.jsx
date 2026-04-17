import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MapController from './MapController';

const MapDisplay = ({ locations, activeLocation, markerRefs, onMarkerClick }) => {
    return (
        <MapContainer 
            center={[37.9838, 23.7275]} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <MapController locations={locations} activeLocation={activeLocation} />

            {locations.map(loc => (
                <Marker 
                    key={loc.id} 
                    position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                    ref={(el) => (markerRefs.current[loc.id] = el)}
                    eventHandlers={{ click: () => onMarkerClick(loc.id) }}
                >
                    <Popup maxWidth={350}>
                        <div className="lp-popup-content">
                            {loc.featured_image_url && (
                                <img src={loc.featured_image_url} className="lp-popup-image" alt="" />
                            )}
                            <h4 className="lp-popup-title">{loc.title.rendered}</h4>
                            <div dangerouslySetInnerHTML={{ __html: loc.content.rendered }} />
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapDisplay;