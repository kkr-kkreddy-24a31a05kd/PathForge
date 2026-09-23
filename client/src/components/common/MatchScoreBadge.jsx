import React from 'react';

const MatchScoreBadge = ({ score = 0, size = 'md', showBar = false, matchedCount, totalCount }) => {
  const numScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color tone based on score threshold
  const isHigh = numScore >= 75;
  const isMedium = numScore >= 45 && numScore < 75;

  const getColors = () => {
    if (isHigh) {
      return {
        bg: 'bg-teal-50 dark:bg-match/15',
        text: 'text-match dark:text-match',
        border: 'border-match/30',
        ring: '#2EC4B6',
        label: 'High Match'
      };
    }
    if (isMedium) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-700/40',
        ring: '#FCA311',
        label: 'Moderate Match'
      };
    }
    return {
      bg: 'bg-gray-100 dark:bg-gray-800/40',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      ring: '#94A3B8',
      label: 'Low Match'
    };
  };

  const colors = getColors();

  if (size === 'sm') {
    return (
      <span
        title={`Match score: ${numScore}%`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-brand text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.ring }} />
        {numScore}% Match
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-brand border ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-heading" style={{ color: colors.ring }}>
              {numScore}%
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-ink-heading dark:text-ink-headingDark">
                Skill Match Score
              </p>
              <p className="text-xs text-ink-body dark:text-ink-bodyDark">
                {colors.label} {totalCount ? `(${matchedCount || 0}/${totalCount} required skills)` : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{ width: `${numScore}%`, backgroundColor: colors.ring }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-brand text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.ring }} />
        {numScore}% Match
      </span>
      {showBar && (
        <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${numScore}%`, backgroundColor: colors.ring }}
          />
        </div>
      )}
    </div>
  );
};

export default MatchScoreBadge;
