import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-brand';

  const variants = {
    // Primary brand: #14213D (deep ink navy)
    primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-dark shadow-subtle',
    // Accent: #FCA311 (amber) - ONLY for CTAs and key highlights
    accent: 'bg-accent text-brand font-semibold hover:bg-accent-hover active:bg-accent-hover shadow-subtle',
    // Match / Success: #2EC4B6 (teal)
    success: 'bg-match text-white hover:bg-match-hover active:bg-match-dark shadow-subtle',
    // Secondary / Outline
    secondary: 'bg-white dark:bg-bg-cardDark text-ink-heading dark:text-ink-headingDark border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-bg-subtleDark shadow-subtle',
    // Ghost
    ghost: 'text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark',
    // Danger
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-subtle'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
