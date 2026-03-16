import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/app':
      case '/app/':
        return 'Dashboard > Upload';
      case '/app/processing':
        return 'Dashboard > Processing Pipeline';
      case '/app/report':
        return 'Dashboard > Reconciliation Report';
      case '/app/history':
        return 'Dashboard > Document History';
      default:
        return 'Dashboard Overview';
    }
  };

  return (
    <header className="h-[70px] w-full bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 shrink-0 z-40 relative">
      <div className="flex items-center">
        <h2 className="text-navy font-bold text-lg tracking-tight">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
          {apiStatus === 'connected' ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-shadow-green"></div>
              <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">API Connected</span>
            </>
          ) : apiStatus === 'offline' ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-red-600 font-bold uppercase tracking-wider">API Offline</span>
            </>
          ) : (
             <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Checking...</span>
          )}
        </div>
        
        <div className="bg-teal/10 text-teal px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border border-teal/20">
          Bennett University
        </div>
        
        <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-black ml-2 shadow-md border hover:scale-105 transition-transform cursor-pointer">
          AK
        </div>
      </div>
    </header>
  );
}
