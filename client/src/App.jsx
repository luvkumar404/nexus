import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import AuditReport from './pages/AuditReport';
import AuditHistory from './pages/AuditHistory';

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const isAuditReport = pathname.startsWith('/audit/');

  return (
    <div className="min-h-screen bg-cloud text-ink dark:bg-slate-950 dark:text-slate-100">
      {!isAuditReport && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/audit/:auditId" element={<AuditReport />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/history" element={<AuditHistory />} />
      </Routes>
      {!isAuditReport && <Footer />}
    </div>
  );
}
