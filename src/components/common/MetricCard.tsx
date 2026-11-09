/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-700/80">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </span>
        {subtext && (
          <span
            className={`text-xs ${
              trend === 'positive'
                ? 'text-emerald-400'
                : trend === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
