import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CurrencyConfig, Transaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface CashflowTrendChartProps {
  currency: CurrencyConfig;
  transactions: Transaction[];
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export const CashflowTrendChart: React.FC<CashflowTrendChartProps> = ({
  currency,
  transactions,
}) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<'6M' | 'YTD'>('6M');

  // Realistic monthly trend data
  const data: MonthlyData[] = [
    { month: 'Apr', income: 7800, expense: 5100 },
    { month: 'Mei', income: 8000, expense: 5300 },
    { month: 'Jun', income: 8200, expense: 4900 },
    { month: 'Jul', income: 8500, expense: 5800 },
    { month: 'Agt', income: 8500, expense: 5200 },
    { month: 'Sep', income: 8500, expense: 5660 },
  ];

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense))) * 1.15;
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 25;

  const pointsCount = data.length;
  const stepX = (width - paddingX * 2) / (pointsCount - 1);

  const getCoordinates = (val: number, index: number) => {
    const x = paddingX + index * stepX;
    const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
    return { x, y };
  };

  const incomeCoords = data.map((d, i) => getCoordinates(d.income, i));
  const expenseCoords = data.map((d, i) => getCoordinates(d.expense, i));

  // Build SVG path
  const buildSmoothPath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (point.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (point.x - prev.x) / 2;
      const cpY2 = point.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
    }, '');
  };

  const incomePath = buildSmoothPath(incomeCoords);
  const expensePath = buildSmoothPath(expenseCoords);

  const incomeArea = `${incomePath} L ${incomeCoords[incomeCoords.length - 1].x} ${
    height - paddingY
  } L ${incomeCoords[0].x} ${height - paddingY} Z`;
  const expenseArea = `${expensePath} L ${expenseCoords[expenseCoords.length - 1].x} ${
    height - paddingY
  } L ${expenseCoords[0].x} ${height - paddingY} Z`;

  const currentHover = activePoint !== null ? data[activePoint] : data[data.length - 1];
  const netHover = currentHover.income - currentHover.expense;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Tren Arus Kas Bulanan
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Interaktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbandingan pemasukan, pengeluaran & tabungan bersih
          </p>
        </div>

        {/* Legend and Timeframe Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <span className="text-slate-600">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
              <span className="text-slate-600">Pengeluaran</span>
            </div>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => setTimeframe('6M')}
              className={`px-2 py-1 rounded-md transition-all ${
                timeframe === '6M'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Bulan
            </button>
            <button
              onClick={() => setTimeframe('YTD')}
              className={`px-2 py-1 rounded-md transition-all ${
                timeframe === 'YTD'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YTD
            </button>
          </div>
        </div>
      </div>

      {/* Hover Info Strip */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-xl p-2.5 mb-3 border border-slate-100 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Bulan: {currentHover.month}
          </span>
          <span className="font-bold text-emerald-600 text-sm">
            +{formatMoney(currentHover.income, currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Pengeluaran
          </span>
          <span className="font-bold text-rose-600 text-sm">
            -{formatMoney(currentHover.expense, currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Arus Kas Bersih
          </span>
          <span className="font-bold text-indigo-700 text-sm">
            +{formatMoney(netHover, currency)}
          </span>
        </div>
      </div>

      {/* SVG Canvas with Interactive Hover */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 select-none"
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = height - paddingY - p * (height - paddingY * 2);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fills */}
          <path d={incomeArea} fill="url(#incomeGradient)" />
          <path d={expenseArea} fill="url(#expenseGradient)" />

          {/* Lines */}
          <path
            d={incomePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={expensePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Data points */}
          {data.map((d, i) => {
            const incPt = incomeCoords[i];
            const expPt = expenseCoords[i];
            const isSelected = activePoint === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(i)}
                onMouseLeave={() => setActivePoint(null)}
              >
                {/* Vertical guide line on hover */}
                {isSelected && (
                  <line
                    x1={incPt.x}
                    y1={paddingY}
                    x2={incPt.x}
                    y2={height - paddingY}
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Income point */}
                <circle
                  cx={incPt.x}
                  cy={incPt.y}
                  r={isSelected ? 6 : 4}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all"
                />

                {/* Expense point */}
                <circle
                  cx={expPt.x}
                  cy={expPt.y}
                  r={isSelected ? 6 : 4}
                  fill="#ffffff"
                  stroke="#f43f5e"
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all"
                />

                {/* X-axis Month Label */}
                <text
                  x={incPt.x}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isSelected ? 'fill-indigo-600 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 text-right">
        <span className="text-[11px] text-slate-400 font-medium">
          Arahkan kursor ke titik grafik untuk rincian tiap bulan
        </span>
      </div>
    </div>
  );
};
