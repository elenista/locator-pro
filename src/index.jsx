import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
    return (
        <div style={{ padding: '20px', background: '#f0f0f0', border: '1px solid #ccc', color: '#333' }}>
            <h2>Hello from React!</h2>
            <p>The Store Locator app is initializing...</p>
        </div>
    );
};

const rootElement = document.getElementById('lp-react-root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}