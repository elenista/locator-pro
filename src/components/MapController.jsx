import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapController = ({ locations, activeLocation }) => {
    const map = useMap();

    // Auto-fit bounds
    useEffect(() => {
        if (locations.length > 0 && !activeLocation) {
            const bounds = L.latLngBounds(locations.map(loc => [
                parseFloat(loc.latitude), 
                parseFloat(loc.longitude)
            ]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);

    // Pan without zoom change
    useEffect(() => {
        if (activeLocation) {
            map.panTo(
                [parseFloat(activeLocation.latitude), parseFloat(activeLocation.longitude)],
                { animate: true, duration: 1 }
            );
        }
    }, [activeLocation, map]);

    return null;
};

export default MapController;