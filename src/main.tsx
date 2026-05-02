import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

window.onerror = (msg, src, line, col, err) => {
  console.error('[Global Error]', msg, 'at', src, ':', line, ':', col, err);
  return false;
};

window.onunhandledrejection = (e) => {
  console.error('[Unhandled Rejection]', e.reason);
};

const Fallback = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 text-sm">Please refresh the page to continue</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary fallback={<Fallback />}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (e) {
  console.error('[Fatal]', e);
  document.body.innerHTML = `
    <div style="min-height:100vh;background:#0f172a;display:flex;align-items:center;justify-content:center;color:white;font-family:system-ui;">
      <div style="text-align:center;">
        <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Please enable JavaScript</h1>
        <p style="color:#94a3b8;">Refresh your browser</p>
      </div>
    </div>
  `;
}

