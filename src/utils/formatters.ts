import { CurrencyConfig } from '../types';

export function formatMoney(val: number, currency: CurrencyConfig, showCents: boolean = false): string {
  const converted = val * currency.rateFromUSD;
  const isZeroDecimals = currency.code === 'IDR';

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: isZeroDecimals || !showCents ? 0 : 2,
    maximumFractionDigits: isZeroDecimals || !showCents ? 0 : 2,
  }).format(converted);
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

export interface HealthScoreResult {
  score: number;
  status: string;
  statusColor: string;
  emergencyMonths: number;
  emergencyStatus: string;
  savingsRate: number;
  dtiStatus: string;
}

export function calculateHealthScore(
  liquidCash: number,
  monthlyExpenses: number,
  savingsRate: number,
  investments: number,
  netWorth: number
): HealthScoreResult {
  let score = 40;
  const baseMonthlyExp = monthlyExpenses > 0 ? monthlyExpenses : 2500;
  const emergencyMonths = Number((liquidCash / baseMonthlyExp).toFixed(1));

  // Factor 1: Emergency Fund Coverage (up to 30 pts)
  if (emergencyMonths >= 6) {
    score += 30;
  } else if (emergencyMonths >= 3) {
    score += 20;
  } else {
    score += (emergencyMonths / 3) * 15;
  }

  // Factor 2: Savings Rate (up to 20 pts)
  if (savingsRate >= 30) {
    score += 20;
  } else if (savingsRate >= 20) {
    score += 15;
  } else if (savingsRate >= 10) {
    score += 8;
  }

  // Factor 3: Investment diversification (up to 15 pts)
  const investRatio = netWorth > 0 ? investments / netWorth : 0;
  if (investRatio >= 0.5) {
    score += 15;
  } else if (investRatio >= 0.25) {
    score += 10;
  }

  const finalScore = Math.min(Math.max(Math.round(score), 10), 100);

  let status = 'Sangat Sehat (Fortress)';
  let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let emergencyStatus = 'Sangat Kuat';

  if (finalScore >= 85) {
    status = 'Sangat Tangguh (Financially Secure)';
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    emergencyStatus = 'Optimal (6+ Bulan)';
  } else if (finalScore >= 70) {
    status = 'Sehat & Tumbuh Positif';
    statusColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    emergencyStatus = 'Stabil & Baik';
  } else if (finalScore >= 50) {
    status = 'Cukup Seimbang';
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    emergencyStatus = 'Perlu Ditingkatkan';
  } else {
    status = 'Perlu Optimasi Arus Kas';
    statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
    emergencyStatus = 'Di Bawah Rekomendasi';
  }

  return {
    score: finalScore,
    status,
    statusColor,
    emergencyMonths,
    emergencyStatus,
    savingsRate,
    dtiStatus: 'Rendah (<10%)',
  };
}

export interface FIRECalculationResult {
  targetFIRENumber: number;
  yearsToFIRE: number;
  targetYear: number;
  totalContributions: number;
  interestGained: number;
  progressPercent: number;
  projectionPoints: { year: number; portfolio: number; contributions: number }[];
}

export function calculateFIRE(
  capital: number,
  monthlyContribution: number,
  annualReturnPct: number,
  desiredMonthlySpend: number
): FIRECalculationResult {
  // Traditional 4% rule = 25x annual expenses
  const annualSpend = desiredMonthlySpend * 12;
  const targetFIRENumber = annualSpend * 25;

  const currentYear = new Date().getFullYear();
  const annualReturn = annualReturnPct / 100;
  const monthlyReturnRate = Math.pow(1 + annualReturn, 1 / 12) - 1;

  let currentPortfolio = capital;
  let totalContributed = capital;
  let years = 0;

  const projectionPoints: { year: number; portfolio: number; contributions: number }[] = [
    {
      year: currentYear,
      portfolio: Math.round(currentPortfolio),
      contributions: Math.round(totalContributed),
    },
  ];

  while (currentPortfolio < targetFIRENumber && years < 35) {
    for (let m = 0; m < 12; m++) {
      currentPortfolio = (currentPortfolio + monthlyContribution) * (1 + monthlyReturnRate);
      totalContributed += monthlyContribution;
    }
    years += 1;
    projectionPoints.push({
      year: currentYear + years,
      portfolio: Math.round(currentPortfolio),
      contributions: Math.round(totalContributed),
    });
  }

  // Fraction refinement
  const yearsToFIRE = Math.min(years, 35);
  const targetYear = currentYear + Math.round(yearsToFIRE);
  const interestGained = Math.max(0, currentPortfolio - totalContributed);
  const progressPercent = Math.min(
    100,
    Number(((capital / (targetFIRENumber || 1)) * 100).toFixed(1))
  );

  return {
    targetFIRENumber,
    yearsToFIRE,
    targetYear,
    totalContributions: totalContributed,
    interestGained,
    progressPercent,
    projectionPoints,
  };
}
