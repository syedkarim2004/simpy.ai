import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Report from './pages/Report';
import History from './pages/History';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Dashboard Layout wrapper component
function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Landing />} />
        
        {/* Dashboard Routes nested under /app */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Upload />} />
          <Route path="processing" element={<Processing />} />
          <Route path="report" element={<Report />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
