import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Report from './pages/Report';
import History from './pages/History';
import MultiPatientUpload from './pages/MultiPatientUpload';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

/* ── Protected route — checks localStorage flag ─────────────── */
function ProtectedRoute({ children }) {
  const isAuthed = localStorage.getItem('simpy_authed') === 'true';
  const hasToken = !!localStorage.getItem('simpy_token');
  if (!isAuthed || !hasToken) return <Navigate to="/login" replace />;
  return children;
}

/* ── Dashboard layout ────────────────────────────────────────── */
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
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Upload />} />
          <Route path="processing" element={<Processing />} />
          <Route path="report" element={<Report />} />
          <Route path="history" element={<History />} />
          <Route path="multi-patient" element={<MultiPatientUpload />} />
        </Route>

        {/* Catch-all → back to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
