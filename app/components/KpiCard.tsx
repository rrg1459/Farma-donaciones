// components/KpiCard.tsx
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: {
      bgIcon: 'bg-blue-50 text-blue-600',
      valueColor: 'text-slate-900',
    },
    warning: {
      bgIcon: 'bg-amber-50 text-amber-600',
      valueColor: 'text-amber-600',
    },
    danger: {
      bgIcon: 'bg-red-50 text-red-600',
      valueColor: 'text-red-600',
    },
    success: {
      bgIcon: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-600',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className={`text-2xl font-bold mt-1 ${style.valueColor}`}>{value}</p>
        <span className="text-xs text-slate-500 font-medium mt-1 block">
          {subtitle}
        </span>
      </div>
      <div className={`p-3 rounded-lg ${style.bgIcon}`}>{icon}</div>
    </div>
  );
};