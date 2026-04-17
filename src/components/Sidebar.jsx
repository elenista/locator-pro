import React from 'react';

const Sidebar = ({ locations, activeId, onLocationClick, isOpen }) => (
    <div className={`lp-sidebar ${!isOpen ? 'is-collapsed' : ''}`}>
        <div className="lp-sidebar-header" style={{ paddingTop: '50px' }}>
            <h3 style={{ margin: 0 }}>Locations</h3>
        </div>
        {locations.map(loc => (
            <div 
                key={loc.id} 
                className={`lp-location-item ${activeId === loc.id ? 'is-active' : ''}`}
                onClick={() => onLocationClick(loc)}
            >
                <strong>{loc.title.rendered}</strong>
            </div>
        ))}
    </div>
);

export default Sidebar;