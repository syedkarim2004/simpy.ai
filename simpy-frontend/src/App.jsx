import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import StaffLogger from './pages/StaffLogger';
import BillingDesk from './pages/BillingDesk';
import AdminPortal from './pages/AdminPortal';

// Existing/Internal Imports
import PreauthLogin from './pages/PreauthLogin';
import PreauthDashboard from './pages/preauth/PreauthDashboard';
import MedicalLogin from './pages/medical/MedicalLogin';
import MedicalDashboard from './pages/MedicalDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Report from './pages/Report';
import History from './pages/History';
import MultiPatientUpload from './pages/MultiPatientUpload';
import DischargeModule from './pages/discharge/DischargeModule';
import PDFUpload from './pages/PDFUpload';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// TPA Portal Imports
import TPALayout from './components/layout/TPALayout';
import TPADashboard from './pages/tpa/index';
import PreAuth from './pages/tpa/pre-auth';
import Approval from './pages/tpa/approval';
import Admission from './pages/tpa/admission';
import Enhancement from './pages/tpa/enhancement';
import Discharge from './pages/tpa/discharge';
import Settlement from './pages/tpa/settlement';

/* ── Protected route — checks localStorage flag ─────────────── */
function ProtectedRoute({ children }) {
  const isAuthed = localStorage.getItem('simpy_authed') === 'true';
  const hasToken = !!localStorage.getItem('simpy_token');
  if (!isAuthed || !hasToken) return <Navigate to="/medical/login" replace />;
  return children;
}

/* ── Dashboard layout ───────────────────────────────────────── */
function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('simpy_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('simpy_sidebar_open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text-dark)] font-body overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'pl-[240px]' : 'pl-[80px]'}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
        <Route path="/" element={<Landing />} />
        <Route path="/staff-logger" element={<StaffLogger />} />
        <Route path="/billing" element={<BillingDesk />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/medical/login" element={<MedicalLogin />} />
        <Route path="/medical/dashboard" element={<MedicalDashboard />} />
        <Route path="/preauth/login" element={<PreauthLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

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
          <Route path="pdf-upload" element={<PDFUpload />} />
          <Route path="discharge" element={<DischargeModule />} />
          <Route path="settlement" element={<DischargeModule />} />
          <Route path="preauth" element={<PreauthDashboard />} />
        </Route>

        {/* ── TPA Administrator Portal ── */}
        <Route path="/tpa" element={<TPALayout />}>
          <Route index element={<TPADashboard />} />
          <Route path="pre-auth" element={<PreAuth />} />
          <Route path="approval" element={<Approval />} />
          <Route path="admission" element={<Admission />} />
          <Route path="enhancement" element={<Enhancement />} />
          <Route path="discharge" element={<Discharge />} />
          <Route path="settlement" element={<Settlement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
