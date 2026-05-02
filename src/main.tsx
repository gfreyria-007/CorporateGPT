import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const Fallback = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="text-slate-400">Please refresh the page</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
      >
        Refresh
      </button>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<Fallback />}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

