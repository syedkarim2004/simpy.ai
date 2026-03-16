import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Upload Document';
      case '/processing':
        return 'Processing Pipeline';
      case '/report':
        return 'Reconciliation Report';
      case '/history':
        return 'Document History';
      default:
        return 'Simpy.ai Dashboard';
    }
  };

  return (
    <header className="h-[60px] w-full bg-navy border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <h2 className="text-white font-semibold text-lg">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-slate-300 font-medium">Backend Connected</span>
        </div>
        
        <div className="bg-teal/20 text-teal px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-teal/30">
          Bennett University
        </div>
        
        <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold ml-2 shadow-sm border border-teal-600">
          AK
        </div>
      </div>
    </header>
  );
}
