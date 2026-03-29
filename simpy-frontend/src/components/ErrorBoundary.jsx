import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-[#e2dfd9] p-10 rounded-[12px] shadow-xl text-center">
            <div className="w-20 h-20 bg-red-50 border border-red-100 flex items-center justify-center rounded-[16px] text-red-500 mx-auto mb-8">
              <AlertCircle size={40} />
            </div>
            
            <h1 className="text-[28px] font-serif font-bold text-[#1a1815] mb-4">System Interruption</h1>
            <p className="text-[#8a857c] text-[15px] leading-relaxed mb-10">
              An unexpected error occurred during rendering. This is often caused by missing clinical data in the current session.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="h-14 bg-[#1d6b4f] text-white font-bold uppercase text-[13px] tracking-wider rounded-[8px] flex items-center justify-center gap-3 hover:opacity-95 transition-all"
              >
                <RefreshCw size={18} /> Reload Session
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="h-14 bg-[#f0efec] text-[#1a1815] font-bold uppercase text-[13px] tracking-wider rounded-[8px] flex items-center justify-center gap-3 hover:bg-[#e2dfd9] transition-all"
              >
                <Home size={18} /> Return to Portal
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 pt-8 border-t border-[#e2dfd9] text-left">
                <p className="font-mono text-[10px] text-[#8a857c] uppercase font-bold mb-2">Debug Info</p>
                <pre className="bg-[#f0efec] p-4 rounded-[6px] text-[10px] text-red-600 overflow-x-auto font-mono">
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
