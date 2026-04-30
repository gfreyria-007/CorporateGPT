
import React from 'react';
import ReactDOM from 'react-dom/client';
import TechieMain from './TechieMain';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

import { AuthProvider } from './core/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <TechieMain />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
