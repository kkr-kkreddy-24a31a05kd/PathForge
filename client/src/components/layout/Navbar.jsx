import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import { Sun, Moon, ArrowRight, Menu, X, Home, Compass, Layers, Building2, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'company') return '/company/dashboard';
    return '/student/dashboard';
  };

  const handleNavAnchor = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  const handleMobileNav = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-bg-cardDark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-brand bg-brand flex items-center justify-center text-accent font-heading font-bold text-lg shadow-sm">
            <span className="translate-y-[-0.5px]">P</span>
            <span className="text-white text-xs -ml-0.5">F</span>
          </div>
          <span className="font-heading font-bold text-xl text-brand dark:text-white tracking-tight">
            Path<span className="text-accent">Forge</span>
          </span>
        </Link>

        {/* Center navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/browse"
            className="text-sm font-medium text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white transition-colors"
          >
            Explore Internships
          </Link>
          <a
            href="#features"
            onClick={(e) => handleNavAnchor(e, 'features')}
            className="text-sm font-medium text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </a>
          <a
            href="#for-companies"
            onClick={(e) => handleNavAnchor(e, 'for-companies')}
            className="text-sm font-medium text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white transition-colors cursor-pointer"
          >
            For Enterprise
          </a>
        </nav>

        {/* Right action group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-brand text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
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

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-brand text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-white dark:bg-bg-cardDark px-4 py-5 shadow-elevated animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-brand text-sm font-medium text-ink-heading dark:text-white hover:bg-gray-50 dark:hover:bg-bg-subtleDark"
            >
              <Home className="w-4 h-4 text-brand dark:text-accent" />
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-brand text-sm font-medium text-ink-heading dark:text-white hover:bg-gray-50 dark:hover:bg-bg-subtleDark"
            >
              <Compass className="w-4 h-4 text-brand dark:text-accent" />
              Explore Internships
            </Link>
            <a
              href="#features"
              onClick={(e) => handleNavAnchor(e, 'features')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-brand text-sm font-medium text-ink-heading dark:text-white hover:bg-gray-50 dark:hover:bg-bg-subtleDark"
            >
              <Layers className="w-4 h-4 text-brand dark:text-accent" />
              How It Works
            </a>
            <a
              href="#for-companies"
              onClick={(e) => handleNavAnchor(e, 'for-companies')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-brand text-sm font-medium text-ink-heading dark:text-white hover:bg-gray-50 dark:hover:bg-bg-subtleDark"
            >
              <Building2 className="w-4 h-4 text-brand dark:text-accent" />
              For Enterprise
            </a>

            <div className="pt-3 border-t border-border-light dark:border-border-dark flex flex-col gap-2">
              {isAuthenticated ? (
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => handleMobileNav(getDashboardPath())}
                  className="w-full justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleMobileNav('/login')}
                    className="w-full justify-center"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Sign In
                  </Button>
                  <Button
                    variant="accent"
                    size="md"
                    onClick={() => handleMobileNav('/register')}
                    className="w-full justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
