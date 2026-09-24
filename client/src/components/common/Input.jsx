import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  required = false,
  rightElement,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-bg-cardDark text-ink-heading dark:text-ink-headingDark border rounded-brand text-sm transition-colors placeholder:text-ink-muted dark:placeholder:text-ink-mutedDark focus:outline-none focus:border-brand dark:focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-accent ${
            rightElement ? 'pr-10' : ''
          } ${
            error
              ? 'border-red-500 dark:border-red-500'
              : 'border-border-light dark:border-border-dark'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-ink-muted dark:text-ink-mutedDark">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
