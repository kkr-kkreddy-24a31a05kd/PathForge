import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-brand border border-dashed border-border-light dark:border-border-dark bg-white/50 dark:bg-bg-cardDark/50 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 mb-4 rounded-brand bg-brand/5 dark:bg-brand-light/10 text-brand dark:text-blue-300 flex items-center justify-center">
          <Icon className="w-6 h-6 stroke-[1.75]" />
        </div>
      )}
      <h3 className="text-lg font-semibold font-heading text-ink-heading dark:text-ink-headingDark mb-1">
        {title}
      </h3>
      <p className="text-sm text-ink-body dark:text-ink-bodyDark max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="accent" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
