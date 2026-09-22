import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  DollarSign,
  ShieldCheck,
  Plane,
  Car,
  Home,
  Clock,
  X,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrencyConfig, SavingsGoal, TabType } from '../types';
import { formatMoney } from '../utils/formatters';

interface GoalProgressTrackerProps {
  goals: SavingsGoal[];
  currency: CurrencyConfig;
  setActiveTab?: (tab: TabType) => void;
  onDepositGoal?: (goalId: string, amountUSD: number) => void;
}

type SortOption = 'remaining-desc' | 'percent-desc' | 'target-desc';
type ChartViewMode = 'gap-bar' | 'donut-breakdown';

export const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({
  goals,
  currency,
  setActiveTab,
  onDepositGoal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id || null);
  const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('remaining-desc');
  const [viewMode, setViewMode] = useState<ChartViewMode>('gap-bar');

  // Quick Deposit Dialog State
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState<string>('500');

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Derived Totals
  const totalTargetUSD = goals.reduce((sum, g) => sum + g.target, 0);
  const totalCurrentUSD = goals.reduce((sum, g) => sum + g.current, 0);
  const totalRemainingUSD = Math.max(0, totalTargetUSD - totalCurrentUSD);
  const overallProgressPercent = totalTargetUSD > 0 ? (totalCurrentUSD / totalTargetUSD) * 100 : 0;

  // Process and sort goal items
  const processedGoals = [...goals].map((g) => {
    const remaining = Math.max(0, g.target - g.current);
    const progress = Math.min(100, Math.max(0, g.target > 0 ? (g.current / g.target) * 100 : 0));
    return {
      ...g,
      remaining,
      progress,
    };
  });

  processedGoals.sort((a, b) => {
    if (sortOption === 'remaining-desc') {
      return b.remaining - a.remaining;
    }
    if (sortOption === 'percent-desc') {
      return b.progress - a.progress;
    }
    return b.target - a.target;
  });

  const activeGoal = processedGoals.find((g) => g.id === (hoveredGoalId || selectedGoalId)) || processedGoals[0];

  // Helper for goal icons
  const renderGoalIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'shield':
        return <ShieldCheck className="w-4 h-4" />;
      case 'car':
        return <Car className="w-4 h-4" />;
      case 'plane':
        return <Plane className="w-4 h-4" />;
      case 'home':
        return <Home className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  // D3 Visualization Render Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || processedGoals.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = containerRef.current.clientWidth;
    const isMobile = containerWidth < 640;

    if (viewMode === 'gap-bar') {
      renderHorizontalGapChart(svg, containerWidth, isMobile);
    } else {
      renderDonutBreakdown(svg, containerWidth, isMobile);
    }
  }, [processedGoals, currency, viewMode, hoveredGoalId, selectedGoalId]);

  // 1. D3 Stacked Gap Comparison Bar Chart
  const renderHorizontalGapChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    isMobile: boolean
  ) => {
    const margin = {
      top: 30,
      right: isMobile ? 35 : 60,
      bottom: 30,
      left: isMobile ? 120 : 170,
    };

    const barHeight = isMobile ? 26 : 32;
    const barGap = isMobile ? 14 : 18;
    const innerHeight = processedGoals.length * (barHeight + barGap);
    const height = innerHeight + margin.top + margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const innerWidth = Math.max(100, width - margin.left - margin.right);

    // Max target scale with padding
    const maxVal = d3.max(processedGoals, (d) => Math.max(d.target, d.current)) || 1000;
    const xScale = d3.scaleLinear().domain([0, maxVal * 1.05]).range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(processedGoals.map((d) => d.id))
      .range([0, innerHeight])
      .padding(0.28);

    // Subtle background gridlines
    const xGrid = d3.axisBottom(xScale).ticks(isMobile ? 3 : 5).tickSize(innerHeight).tickFormat(() => '');
    chart
      .append('g')
      .attr('class', 'grid text-slate-100')
      .call(xGrid)
      .selectAll('.tick line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3 3');

    // Goal Rows
    const rows = chart
      .selectAll('.goal-row')
      .data(processedGoals)
      .enter()
      .append('g')
      .attr('class', 'goal-row cursor-pointer')
      .attr('transform', (d) => `translate(0, ${yScale(d.id)})`)
      .on('mouseenter', (event, d) => {
        setHoveredGoalId(d.id);
        showTooltip(event, d);
      })
      .on('mousemove', (event, d) => {
        showTooltip(event, d);
      })
      .on('mouseleave', () => {
        setHoveredGoalId(null);
        hideTooltip();
      })
      .on('click', (_, d) => {
        setSelectedGoalId(d.id);
      });

    // 1. Background Total Track (Target Envelope)
    rows
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d) => xScale(d.target))
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', '#f1f5f9')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1);

    // 2. Segment: Sisa Dana yang Dibutuhkan (The Remaining Gap)
    rows
      .append('rect')
      .attr('class', 'remaining-rect')
      .attr('x', (d) => xScale(Math.min(d.current, d.target)))
      .attr('y', 0)
      .attr('width', 0) // start at 0 for transition
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', (d) => (d.id === (hoveredGoalId || selectedGoalId) ? '#cbd5e1' : '#e2e8f0'))
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => Math.max(0, xScale(d.target) - xScale(Math.min(d.current, d.target))));

    // 3. Segment: Dana Terkumpul Saat Ini (Achieved)
    rows
      .append('rect')
      .attr('class', 'current-rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0) // start at 0 for transition
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', (d) => {
        const isHighlight = d.id === (hoveredGoalId || selectedGoalId);
        if (d.progress >= 100) return isHighlight ? '#059669' : '#10b981';
        return isHighlight ? '#4338ca' : '#6366f1';
      })
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => Math.min(xScale(d.target), xScale(d.current)));

    // 4. Target Threshold Indicator Line at end of target
    rows
      .append('line')
      .attr('x1', (d) => xScale(d.target))
      .attr('x2', (d) => xScale(d.target))
      .attr('y1', -3)
      .attr('y2', yScale.bandwidth() + 3)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2 2')
      .attr('opacity', 0.6);

    // 5. Y-Axis Goal Labels (Truncated cleanly with category tag)
    rows
      .append('text')
      .attr('x', -10)
      .attr('y', yScale.bandwidth() / 2 - (isMobile ? 1 : 2))
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .attr('class', 'text-xs font-bold fill-slate-800')
      .style('font-size', isMobile ? '10px' : '12px')
      .style('font-weight', '700')
      .text((d) => {
        const maxLen = isMobile ? 14 : 22;
        return d.name.length > maxLen ? d.name.slice(0, maxLen) + '…' : d.name;
      });

    // Subtitle under Goal Label showing remaining need
    rows
      .append('text')
      .attr('x', -10)
      .attr('y', yScale.bandwidth() / 2 + (isMobile ? 11 : 13))
      .attr('text-anchor', 'end')
      .attr('class', 'fill-slate-400 font-medium')
      .style('font-size', isMobile ? '9px' : '10px')
      .text((d) => `Sisa: ${formatMoney(d.remaining, currency)}`);

    // 6. Right Side Percentage Badge
    rows
      .append('text')
      .attr('x', (d) => xScale(d.target) + 8)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'central')
      .attr('class', 'font-black')
      .style('font-size', isMobile ? '10px' : '11px')
      .attr('fill', (d) => (d.progress >= 90 ? '#059669' : '#4f46e5'))
      .text((d) => `${d.progress.toFixed(0)}%`);

    // Top X-Axis Scale labels
    const xAxis = d3
      .axisTop(xScale)
      .ticks(isMobile ? 3 : 5)
      .tickFormat((d) => formatMoney(Number(d), currency));

    chart
      .append('g')
      .attr('class', 'x-axis text-[10px] text-slate-400')
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-weight', '600');

    chart.select('.x-axis path').attr('stroke', '#e2e8f0');
    chart.selectAll('.x-axis line').attr('stroke', '#cbd5e1');
  };

  // 2. D3 Radial / Donut Breakdown of Remaining Needs
  const renderDonutBreakdown = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    isMobile: boolean
  ) => {
    const size = Math.min(width, 360);
    const height = size;
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    const radius = size / 2;
    const donutG = svg.append('g').attr('transform', `translate(${width / 2}, ${radius})`);

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(processedGoals.map((d) => d.id))
      .range(['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']);

    const pie = d3
      .pie<typeof processedGoals[0]>()
      .value((d) => Math.max(1, d.remaining))
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<typeof processedGoals[0]>>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius * 0.88)
      .cornerRadius(4)
      .padAngle(0.03);

    const arcHover = d3
      .arc<d3.PieArcDatum<typeof processedGoals[0]>>()
      .innerRadius(radius * 0.56)
      .outerRadius(radius * 0.92)
      .cornerRadius(6)
      .padAngle(0.03);

    const arcs = donutG
      .selectAll('.arc')
      .data(pie(processedGoals))
      .enter()
      .append('g')
      .attr('class', 'arc cursor-pointer')
      .on('mouseenter', (event, d) => {
        setHoveredGoalId(d.data.id);
        showTooltip(event, d.data);
      })
      .on('mousemove', (event, d) => {
        showTooltip(event, d.data);
      })
      .on('mouseleave', () => {
        setHoveredGoalId(null);
        hideTooltip();
      })
      .on('click', (_, d) => {
        setSelectedGoalId(d.data.id);
      });

    arcs
      .append('path')
      .attr('fill', (d) => colorScale(d.data.id))
      .attr('d', (d) =>
        d.data.id === (hoveredGoalId || selectedGoalId) ? (arcHover(d) as string) : (arc(d) as string)
      )
      .style('transition', 'all 0.2s ease');

    // Center Display
    const centerG = donutG.append('g').attr('text-anchor', 'middle');
    centerG
      .append('text')
      .attr('y', -12)
      .attr('class', 'text-[11px] font-black uppercase tracking-wider fill-slate-400')
      .text('Total Sisa Dana');

    centerG
      .append('text')
      .attr('y', 14)
      .attr('class', 'text-base sm:text-lg font-black fill-slate-900')
      .text(formatMoney(totalRemainingUSD, currency));

    centerG
      .append('text')
      .attr('y', 30)
      .attr('class', 'text-[10px] font-bold fill-indigo-600')
      .text(`${overallProgressPercent.toFixed(0)}% Tercapai`);
  };

  // Tooltip Helper
  const showTooltip = (event: MouseEvent, goal: typeof processedGoals[0]) => {
    if (!tooltipRef.current) return;
    const tooltip = tooltipRef.current;
    tooltip.style.display = 'block';

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      tooltip.style.left = `${Math.min(x + 12, rect.width - 240)}px`;
      tooltip.style.top = `${Math.max(10, y - 60)}px`;
    }

    tooltip.innerHTML = `
      <div class="font-extrabold text-xs text-slate-900 leading-tight mb-1 flex items-center justify-between gap-2">
        <span>${goal.name}</span>
        <span class="text-indigo-600 text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">${goal.progress.toFixed(0)}%</span>
      </div>
      <div class="space-y-0.5 text-[11px] text-slate-500 font-medium">
        <div>Dana Terkumpul: <span class="font-bold text-slate-800">${formatMoney(goal.current, currency)}</span></div>
        <div>Target Total: <span class="font-bold text-slate-800">${formatMoney(goal.target, currency)}</span></div>
        <div class="pt-1 mt-1 border-t border-slate-100 font-extrabold text-rose-600 flex items-center justify-between">
          <span>Sisa Dibutuhkan:</span>
          <span>${formatMoney(goal.remaining, currency)}</span>
        </div>
      </div>
    `;
  };

  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  if (goals.length === 0) {
    return (
      <div
        id="goal-progress-tracker"
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Pelacak Progres Target Tabungan & Sisa Dana (d3.js)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Visualisasi interaktif kebutuhan sisa dana untuk setiap impian finansial
              </p>
            </div>
          </div>
        </div>

        <div className="py-10 px-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            Belum Ada Target Tabungan yang Tercatat
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Akun Anda bersih dimulai dari Rp 0. Tentukan target finansial impian Anda (misalnya Dana Darurat, Tabungan Liburan, atau Investasi Rumah) untuk memvisualisasikan sisa dana yang dibutuhkan di sini.
          </p>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('budgeting')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>+ Buat Target Tabungan Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="goal-progress-tracker"
      className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden"
    >
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/5 via-sky-400/5 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-2">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Goal Progress Tracker (d3.js)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            Visualisasi Sisa Dana & Kesenjangan Target Finansial
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Monitor berapa banyak sisa dana yang masih harus Anda kumpulkan untuk setiap impian keuangan Anda secara presisi.
          </p>
        </div>

        {/* View Modes & Sorting Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('gap-bar')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'gap-bar' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Bar Kesenjangan"
              aria-label="Tampilan Bar Kesenjangan"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bagan Kesenjangan</span>
            </button>
            <button
              onClick={() => setViewMode('donut-breakdown')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'donut-breakdown'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Donut Proporsi"
              aria-label="Tampilan Donut Proporsi"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Proporsi Donut</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="remaining-desc">Sisa Terbesar</option>
              <option value="percent-desc">% Tertinggi</option>
              <option value="target-desc">Target Terbesar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
            Total Target Semua Goal
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">
            {formatMoney(totalTargetUSD, currency)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Dari {goals.length} target aktif</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
          <span className="text-[10px] font-black uppercase text-indigo-700 block tracking-wider">
            Dana Terkumpul Saat Ini
          </span>
          <span className="text-base sm:text-lg font-black text-indigo-900 block mt-0.5">
            {formatMoney(totalCurrentUSD, currency)}
          </span>
          <span className="text-[11px] text-indigo-600 font-bold">{overallProgressPercent.toFixed(1)}% tercapai</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80">
          <span className="text-[10px] font-black uppercase text-rose-700 block tracking-wider">
            Sisa Dana yang Dibutuhkan
          </span>
          <span className="text-base sm:text-lg font-black text-rose-900 block mt-0.5">
            {formatMoney(totalRemainingUSD, currency)}
          </span>
          <span className="text-[11px] text-rose-600 font-bold">Kekurangan total saat ini</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
          <span className="text-[10px] font-black uppercase text-emerald-700 block tracking-wider">
            Rata-Rata Pencapaian
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-900 block mt-0.5">
            {overallProgressPercent.toFixed(0)}%
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">On track menuju target</span>
        </div>
      </div>

      {/* Main Interactive D3 Visualizer & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* D3 Canvas Container (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 relative min-h-[300px]" ref={containerRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block" />
                <span>Dana Terkumpul</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block border border-slate-300" />
                <span>Sisa Dibutuhkan</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Arahkan kursor / klik untuk detail
            </span>
          </div>

          {/* D3 Rendered SVG */}
          <div className="w-full overflow-x-auto flex justify-center">
            <svg ref={svgRef} className="w-full h-auto select-none" />
          </div>

          {/* Floating Tooltip Element */}
          <div
            ref={tooltipRef}
            className="absolute z-20 pointer-events-none hidden bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200 w-56 text-left transition-opacity duration-150"
          />
        </div>

        {/* Selected Goal Spotlight Inspector (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          {activeGoal ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      {renderGoalIcon(activeGoal.iconName)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {activeGoal.category}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {activeGoal.name}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Progress Bar in Inspector */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Pencapaian:</span>
                    <span className="text-indigo-600">{activeGoal.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeGoal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Numeric Financial Gap Breakdown */}
                <div className="mt-4 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 font-medium">Target Total:</span>
                    <span className="font-bold text-slate-900">{formatMoney(activeGoal.target, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 font-medium">Dana Terkumpul:</span>
                    <span className="font-bold text-emerald-600">
                      {formatMoney(activeGoal.current, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-extrabold text-rose-600">Sisa Dana Dibutuhkan:</span>
                    <span className="font-black text-rose-600 text-sm">
                      {formatMoney(activeGoal.remaining, currency)}
                    </span>
                  </div>
                  {activeGoal.deadline && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Tenggat Waktu:</span>
                      </span>
                      <span className="font-bold text-slate-700">{activeGoal.deadline}</span>
                    </div>
                  )}
                </div>

                {/* Interactive recommendation */}
                <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 font-medium">
                  💡 <span className="font-bold">Saran Alokasi:</span> Butuh{' '}
                  <span className="font-bold text-indigo-700">
                    {formatMoney(activeGoal.remaining / 10, currency)}
                  </span>
                  /bulan selama 10 bulan ke depan untuk menutup sisa dana ini.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {onDepositGoal && (
                  <button
                    onClick={() => {
                      const defVal = currency.code === 'IDR' ? '500000' : '100';
                      setDepositAmountInput(defVal);
                      setDepositModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Setor Dana</span>
                  </button>
                )}
                {setActiveTab && (
                  <button
                    onClick={() => setActiveTab('budgeting')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Buka Tab Anggaran & Target"
                    aria-label="Buka Tab Anggaran & Target"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              Pilih salah satu goal untuk melihat kalkulasi sisa dana
            </div>
          )}
        </div>
      </div>

      {/* Quick Deposit Modal */}
      {depositModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  {renderGoalIcon(activeGoal.iconName)}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 leading-tight">
                    Setor Dana ke Target
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {activeGoal.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDepositModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(depositAmountInput);
                if (amt > 0 && onDepositGoal) {
                  const amtUSD = amt / currency.rateFromUSD;
                  onDepositGoal(activeGoal.id, amtUSD);
                  confetti({
                    particleCount: 60,
                    spread: 60,
                    origin: { y: 0.6 },
                  });
                  setDepositModalOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Setoran ({currency.code})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={depositAmountInput}
                    onChange={(e) => setDepositAmountInput(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Nominal Cepat
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(currency.code === 'IDR'
                    ? [100000, 500000, 1000000]
                    : [50, 100, 250]
                  ).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmountInput(val.toString())}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] transition-colors cursor-pointer text-center"
                    >
                      +{val.toLocaleString(currency.locale)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Sisa Dana Saat Ini:</span>
                  <span className="font-bold text-rose-600">{formatMoney(activeGoal.remaining, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Setelah Setoran:</span>
                  <span className="font-bold text-indigo-700">
                    {formatMoney(
                      Math.max(
                        0,
                        activeGoal.remaining - (parseFloat(depositAmountInput) || 0) / currency.rateFromUSD
                      ),
                      currency
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Konfirmasi Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
