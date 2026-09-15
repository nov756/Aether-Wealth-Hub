import React, { useState } from 'react';
import {
  Flame,
  Rocket,
  TrendingUp,
  Coins,
  Calendar,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CurrencyConfig, FIREParams } from '../types';
import { calculateFIRE, formatMoney } from '../utils/formatters';

interface FIRESimulatorTabProps {
  params: FIREParams;
  setParams: React.Dispatch<React.SetStateAction<FIREParams>>;
  currency: CurrencyConfig;
}

export const FIRESimulatorTab: React.FC<FIRESimulatorTabProps> = ({
  params,
  setParams,
  currency,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const results = calculateFIRE(
    params.capital,
    params.monthly,
    params.annualReturn,
    params.desiredMonthlySpend
  );

  const points = results.projectionPoints;
  const maxPortfolio = Math.max(
    results.targetFIRENumber * 1.15,
    ...points.map((p) => p.portfolio)
  );

  const width = 560;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

  const stepX = (width - paddingX * 2) / Math.max(points.length - 1, 1);

  const getCoordinates = (val: number, index: number) => {
    const x = paddingX + index * stepX;
    const y = height - paddingY - (val / (maxPortfolio || 1)) * (height - paddingY * 2);
    return { x, y };
  };

  const portfolioCoords = points.map((p, i) => getCoordinates(p.portfolio, i));
  const contributionCoords = points.map((p, i) => getCoordinates(p.contributions, i));

  const targetLineY =
    height - paddingY - (results.targetFIRENumber / (maxPortfolio || 1)) * (height - paddingY * 2);

  const buildPath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (pt.x - prev.x) / 2;
      const cpY2 = pt.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const portfolioPath = buildPath(portfolioCoords);
  const contributionPath = buildPath(contributionCoords);

  const portfolioArea = `${portfolioPath} L ${
    portfolioCoords[portfolioCoords.length - 1].x
  } ${height - paddingY} L ${portfolioCoords[0].x} ${height - paddingY} Z`;

  const hoveredData = hoveredPoint !== null ? points[hoveredPoint] : points[points.length - 1];

  // Milestone benchmarks
  const leanFire = results.targetFIRENumber * 0.75;
  const fatFire = results.targetFIRENumber * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500 text-white shadow-xs">
              <Flame className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Simulator Kebebasan Finansial (FIRE)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Hitung efek bunga bergulung (*compounding interest*) dan tentukan tanggal
            pensiun dini mandiri dengan aturan penarikan aman 4% (25x Pengeluaran Tahunan).
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-amber-200 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Angka FIRE Target Anda
          </span>
          <span className="text-xl font-black text-slate-900">
            {formatMoney(results.targetFIRENumber, currency)}
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Controls & Real-Time Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Parameter Keuangan
            </h3>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Real-time Slider
            </span>
          </div>

          {/* Slider 1: Capital */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Modal Awal / Portofolio:</span>
              <span className="text-indigo-700 font-bold">
                {formatMoney(params.capital, currency)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={params.capital}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, capital: parseFloat(e.target.value) }))
              }
              className="w-full accent-indigo-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{formatMoney(0, currency)}</span>
              <span>{formatMoney(500000, currency)}</span>
            </div>
          </div>

          {/* Slider 2: Monthly Contribution */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Investasi Rutin Bulanan:</span>
              <span className="text-emerald-700 font-bold">
                {formatMoney(params.monthly, currency)}/bln
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="15000"
              step="100"
              value={params.monthly}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, monthly: parseFloat(e.target.value) }))
              }
              className="w-full accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{formatMoney(100, currency)}</span>
              <span>{formatMoney(15000, currency)}</span>
            </div>
          </div>

          {/* Slider 3: Return % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Imbal Hasil Tahunan Pasar (%):</span>
              <span className="text-amber-700 font-bold">{params.annualReturn}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="18"
              step="0.5"
              value={params.annualReturn}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  annualReturn: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-amber-500 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>2.0% (Konservatif)</span>
              <span>18.0% (Agresif)</span>
            </div>
          </div>

          {/* Slider 4: Desired Monthly Spend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Pengeluaran Pensiun Impian:</span>
              <span className="text-rose-700 font-bold">
                {formatMoney(params.desiredMonthlySpend, currency)}/bln
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="250"
              value={params.desiredMonthlySpend}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  desiredMonthlySpend: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-rose-500 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{formatMoney(1000, currency)}</span>
              <span>{formatMoney(15000, currency)}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Perhitungan menggunakan kaidah *Trinity Study 4% Rule*, yaitu nilai aset
              cukup menopang gaya hidup selamanya tanpa mengurangi pokok modal.
            </span>
          </div>
        </div>

        {/* Dynamic Simulation Output and Visual Projection Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metric Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Waktu Menuju Bebas
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1">
                {results.yearsToFIRE >= 35 ? '35+ Thn' : `${results.yearsToFIRE.toFixed(1)} Thn`}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Disiplin investasi rutin
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Tahun Pencapaian
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {results.targetYear}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                Pensiun Mandiri
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Hasil Bunga Bergulung
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                +{formatMoney(results.interestGained, currency)}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Keuntungan compounding
              </span>
            </div>
          </div>

          {/* Interactive Compounding Curve Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Proyeksi Pertumbuhan Eksponensial Portofolio
                </h4>
                <p className="text-xs text-slate-500">
                  Kurva portofolio (Area Ungu) vs modal yang disetor (Garis Abu-Abu)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-slate-600">Portofolio</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600">Modal Disetor</span>
                </div>
              </div>
            </div>

            {/* Hovered Data Banner */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Tahun</span>
                <span className="font-extrabold text-slate-900">{hoveredData.year}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Portofolio</span>
                <span className="font-black text-indigo-700">
                  {formatMoney(hoveredData.portfolio, currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Setoran</span>
                <span className="font-bold text-slate-700">
                  {formatMoney(hoveredData.contributions, currency)}
                </span>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative w-full overflow-hidden">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 select-none">
                <defs>
                  <linearGradient id="fireGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Target FIRE Line */}
                <line
                  x1={paddingX}
                  y1={targetLineY}
                  x2={width - paddingX}
                  y2={targetLineY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - paddingX}
                  y={Math.max(targetLineY - 6, 12)}
                  textAnchor="end"
                  className="fill-emerald-700 text-[10px] font-bold"
                >
                  Target FIRE ({formatMoney(results.targetFIRENumber, currency)})
                </text>

                {/* Area and Curves */}
                <path d={portfolioArea} fill="url(#fireGradient)" />
                <path
                  d={contributionPath}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                <path
                  d={portfolioPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {points.map((p, idx) => {
                  const pt = portfolioCoords[idx];
                  const isHovered = hoveredPoint === idx;

                  return (
                    <g
                      key={p.year}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1={paddingY}
                          x2={pt.x}
                          y2={height - paddingY}
                          stroke="#6366f1"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3}
                        fill="#ffffff"
                        stroke="#6366f1"
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Tier Milestones: Lean, Standard, Fat FIRE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Lean FIRE (75%)
              </span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {formatMoney(leanFire, currency)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Gaya hidup hemat & esensial
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                Standard FIRE (100%)
              </span>
              <div className="text-base font-black text-indigo-700 mt-0.5">
                {formatMoney(results.targetFIRENumber, currency)}
              </div>
              <span className="text-[11px] text-indigo-900 block mt-1">
                Gaya hidup normal idaman
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Fat FIRE (150%)
              </span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {formatMoney(fatFire, currency)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Gaya hidup mewah & fleksibel
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
