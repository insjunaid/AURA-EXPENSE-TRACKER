import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DateProvider } from './context/DateContext';
import { UIProvider } from './context/UIContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ServerWakeBanner from './components/ServerWakeBanner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import InvestmentsPage from './pages/InvestmentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DateProvider>
          <Router>
            <UIProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Signed-in app (layout stays mounted; only the page animates) */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/investments" element={<InvestmentsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </UIProvider>
          </Router>

          <ServerWakeBanner />
          <Toaster
            position="top-center"
            gutter={8}
            containerStyle={{ top: 'max(12px, env(safe-area-inset-top))' }}
            toastOptions={{
              duration: 2800,
              className: '!bg-ink !text-canvas !rounded-2xl !shadow-lift !text-[14px] !font-medium !px-4 !py-3',
              success: { iconTheme: { primary: '#34d399', secondary: '#0c0c0d' } },
              error: { iconTheme: { primary: '#fb7185', secondary: '#0c0c0d' } },
            }}
          />
        </DateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
