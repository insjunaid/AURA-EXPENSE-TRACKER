import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, loading } = useAuth();

  // If already logged in, skip the landing page
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-dark-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-4 md:px-12 flex items-center justify-between z-10 border-b border-dark-200 dark:border-dark-800 bg-white/70 dark:bg-dark-900/70 backdrop-blur-md fixed top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center font-bold text-white dark:text-black">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">Aura</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-dark-600 dark:hover:text-dark-300 transition-colors">
            Log In
          </Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-sm hidden sm:block">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-lighten" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Master your wealth with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark-900 to-dark-500 dark:from-white dark:to-dark-400">
              absolute clarity.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Aura is a premium, beautifully designed personal finance manager. Track your daily expenses, monitor your investments, and visualize your savings rate—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 shadow-xl shadow-black/10 dark:shadow-white/10 hover:scale-105 transition-transform">
              Start Tracking Free
            </Link>
            <Link to="/login" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto w-full text-left"
        >
          <div className="glass-card p-8 rounded-3xl hover:border-dark-300 dark:hover:border-dark-600 transition-colors">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">Interactive charts and visual breakdowns of exactly where your money goes every month.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl hover:border-dark-300 dark:hover:border-dark-600 transition-colors">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Total Privacy</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">Your financial data is strictly isolated. No third-party trackers, and no bank linking required.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl hover:border-dark-300 dark:hover:border-dark-600 transition-colors">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Asset Tracking</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">Separate your everyday expenses from your long-term investments for true net-worth visibility.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-200 dark:border-dark-800 py-10 px-6 mt-12 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-black dark:bg-white flex items-center justify-center font-bold text-[10px] text-white dark:text-black">
              A
            </div>
            <span className="font-semibold tracking-tight text-dark-900 dark:text-white">Aura Wealth Manager</span>
          </div>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Designed for those who demand excellence in their finances.
          </p>
          <div className="text-sm text-dark-400">
            &copy; {new Date().getFullYear()} Aura. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
