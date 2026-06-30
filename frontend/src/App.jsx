import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import InvestmentsPage from './pages/InvestmentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
