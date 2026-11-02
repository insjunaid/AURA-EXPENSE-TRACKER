import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from './ui/Logo';

export function SplashScreen({ label = 'Loading your finances…' }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <LogoMark size={56} className="animate-pulse-dot" />
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
