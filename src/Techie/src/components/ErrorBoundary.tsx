
import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  render() {
    if ((this as any).state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
              ¡Ups! Algo salió mal
            </h2>
            <p className="text-blue-200 text-sm font-medium leading-relaxed mb-8">
              Ha ocurrido un error inesperado en la aplicación. Por favor, intenta recargar la página.
            </p>
            
            {(this as any).state.error && (
              <div className="bg-black/30 rounded-2xl p-4 mb-8 text-left overflow-auto max-h-40">
                <p className="text-red-400 font-mono text-[10px] break-all">
                  {(this as any).state.error.toString()}
                </p>
                {(this as any).state.errorInfo && (
                  <pre className="text-blue-300 font-mono text-[8px] mt-2">
                    {(this as any).state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-[#1e3a8a] px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all active:scale-95"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
