import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import PortalSelect from './pages/PortalSelect';
import PreauthLogin from './pages/PreauthLogin';
import PreauthDashboard from './pages/PreauthDashboard';
import MedicalLogin from './pages/MedicalLogin';
import MedicalDashboard from './pages/MedicalDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
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
  if (!isAuthed || !hasToken) return <Navigate to="/medical/login" replace />;
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
        {/* Entry Point */}
        <Route path="/" element={<PortalSelect />} />

        {/* Pre-Auth Portal */}
        <Route path="/preauth/login" element={<PreauthLogin />} />
        <Route path="/preauth/dashboard" element={<PreauthDashboard />} />

        {/* Medical Portal */}
        <Route path="/medical/login" element={<MedicalLogin />} />
        <Route path="/medical/dashboard" element={<MedicalDashboard />} />

        {/* Admin Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Existing Routes (Legacy/Medical Detail) */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
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

        {/* Catch-all → back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
