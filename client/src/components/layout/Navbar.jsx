import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import { Sun, Moon, ShieldCheck, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'company') return '/company/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-bg-cardDark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-brand bg-brand flex items-center justify-center text-accent font-heading font-bold text-lg shadow-sm">
            <span className="translate-y-[-0.5px]">P</span>
            <span className="text-white text-xs -ml-0.5">F</span>
          </div>
          <span className="font-heading font-bold text-xl text-brand dark:text-white tracking-tight">
            Path<span className="text-accent">Forge</span>
          </span>
        </Link>

        {/* Center navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/browse"
            className="text-sm font-medium text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white transition-colors"
          >
            Explore Internships
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#for-companies"
            className="text-sm font-medium text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white transition-colors"
          >
            For Enterprise
          </a>
        </nav>

        {/* Right action group */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-brand text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(getDashboardPath())}
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
