import React, { useState } from 'react';
import { Account, CurrencyConfig } from '../types';
import { formatMoney } from '../utils/formatters';

interface AssetAllocationChartProps {
  accounts: Account[];
  currency: CurrencyConfig;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  accounts,
  currency,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const colors = [
    { bg: '#3b82f6', light: '#eff6ff', border: '#bfdbfe', name: 'Biru' },
    { bg: '#10b981', light: '#ecfdf5', border: '#a7f3d0', name: 'Hijau' },
    { bg: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe', name: 'Ungu' },
    { bg: '#f59e0b', light: '#fffbeb', border: '#fde68a', name: 'Kuning' },
    { bg: '#06b6d4', light: '#ecfeff', border: '#a5f3fc', name: 'Sian' },
    { bg: '#ec4899', light: '#fdf2f8', border: '#fbcfe8', name: 'Merah Muda' },
  ];

  const total = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Calculate SVG arc paths
  const radius = 68;
  const strokeWidth = 24;
  const center = 90;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const segments = accounts.map((acc, i) => {
    const percent = total > 0 ? (acc.balance / total) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;

    return {
      account: acc,
      percent,
      strokeDasharray,
      strokeDashoffset,
      color: colors[i % colors.length],
    };
  });

  const activeAccount = hoveredIdx !== null ? accounts[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Alokasi Aset & Likuiditas</h3>
          <p className="text-xs text-slate-500">Distribusi portofolio lintas akun</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          {accounts.length} Akun Aktif
        </span>
      </div>

      {/* Donut Chart SVG Container */}
      <div className="relative flex items-center justify-center py-2">
        <svg viewBox="0 0 180 180" className="w-44 h-44 transform -rotate-90">
          {/* Base background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <circle
                key={seg.account.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color.bg}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Centered Total / Hovered details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {activeAccount ? activeAccount.type : 'Total Kekayaan'}
          </span>
          <span className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
            {activeAccount
              ? formatMoney(activeAccount.balance, currency)
              : formatMoney(total, currency)}
          </span>
          {activeAccount && (
            <span className="text-[11px] font-bold text-indigo-600">
              {((activeAccount.balance / (total || 1)) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Interactive Legend List */}
      <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {segments.map((seg, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={seg.account.id}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                isHovered ? 'bg-slate-100 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color.bg }}
                />
                <span className="font-semibold text-slate-800 truncate">
                  {seg.account.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-slate-900">
                  {formatMoney(seg.account.balance, currency)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 w-9 text-right">
                  {seg.percent.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
