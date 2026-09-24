import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ShieldCheck, ArrowRight, UserCheck, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const res = await login(trimmedEmail, password);
    setLoading(false);

    if (res.success) {
      if (redirectUrl && res.user.role === 'student') {
        navigate(redirectUrl);
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  const fillDemo = (role) => {
    if (role === 'student') {
      setEmail('student@pathforge.com');
      setPassword('password123');
    } else if (role === 'company') {
      setEmail('company@pathforge.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@pathforge.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-brand bg-brand flex items-center justify-center text-accent font-heading font-bold text-xl shadow-sm">
            <span>P</span>
            <span className="text-white text-xs -ml-0.5">F</span>
          </div>
          <span className="font-heading font-bold text-2xl text-brand dark:text-white tracking-tight">
            Path<span className="text-accent">Forge</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-ink-body dark:text-ink-bodyDark">
          Access your personalized dashboard, opportunities, and schedule
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-bg-cardDark py-8 px-6 sm:px-10 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          {error && (
            <div className="mb-6 p-3 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.edu or you@company.com"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-ink-muted hover:text-ink-heading dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="accent"
                className="w-full font-semibold"
                loading={loading}
              >
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted dark:text-ink-mutedDark text-center mb-3">
              One-Click Demo Credentials:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark hover:border-accent text-ink-heading dark:text-white"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemo('company')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark hover:border-accent text-ink-heading dark:text-white"
              >
                Company
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark hover:border-accent text-ink-heading dark:text-white"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted dark:text-ink-mutedDark">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand dark:text-accent hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
