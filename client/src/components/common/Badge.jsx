import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-brand tracking-tight';

  const variants = {
    default: 'bg-gray-100 dark:bg-bg-subtleDark text-ink-body dark:text-ink-bodyDark border border-border-light dark:border-border-dark',
    skill: 'bg-blue-50/60 dark:bg-brand-light/20 text-brand dark:text-blue-300 border border-blue-100 dark:border-brand-light/30',
    accent: 'bg-accent-subtle dark:bg-accent/15 text-accent dark:text-accent-light border border-accent/20',
    // Status colors
    submitted: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
    shortlisted: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40',
    interview_scheduled: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40',
    accepted: 'bg-teal-50 dark:bg-teal-950/30 text-match dark:text-match border border-teal-200 dark:border-teal-800/40 font-semibold',
    rejected: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40',
    // Open/Closed
    open: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
    closed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
