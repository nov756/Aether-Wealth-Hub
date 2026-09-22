import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  Circle,
  Bell,
  BellOff,
  Trophy,
  Sparkles,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { DailyStreakState } from '../types';

interface DailyStreakWidgetProps {
  streak: DailyStreakState;
  onCheckIn: () => void;
  onToggleTask: (taskId: string) => void;
  onToggleReminder: () => void;
  onOpenTransaction?: () => void;
  compact?: boolean;
}

export const DailyStreakWidget: React.FC<DailyStreakWidgetProps> = ({
  streak,
  onCheckIn,
  onToggleTask,
  onToggleReminder,
  onOpenTransaction,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState<boolean>(!compact);

  const completedTasksCount = streak.dailyTasks.filter((t) => t.completed).length;
  const totalTasks = streak.dailyTasks.length;
  const progressPercent = Math.round((completedTasksCount / totalTasks) * 100);

  const handleClaimCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!streak.checkedInToday) {
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f97316', '#eab308', '#10b981', '#6366f1'],
        });
      } catch {
        // Safe confetti fallback
      }
      onCheckIn();
    }
  };

  // Determine streak level tier
  const getStreakTier = (count: number) => {
    if (count >= 30) return { title: 'Titan Keuangan', color: 'from-amber-500 to-yellow-400', badge: 'Tier Master 🌟' };
    if (count >= 14) return { title: 'Disiplin Teruji', color: 'from-orange-500 to-amber-500', badge: 'Tier Gold 🔥' };
    if (count >= 7) return { title: 'Konsisten Membangun', color: 'from-indigo-500 to-sky-500', badge: 'Tier Silver ⚡' };
    return { title: 'Langkah Awal', color: 'from-emerald-500 to-teal-500', badge: 'Tier Perunggu 🌱' };
  };

  const tier = getStreakTier(streak.streakCount);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-slate-950/20 border border-slate-800/80 transition-all">
      {/* Top Header Card */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Flame className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
            {streak.checkedInToday && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                {streak.streakCount} Hari
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {tier.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span>{tier.title}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Rekor: {streak.bestStreak}h</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={expanded ? 'Ciutkan pengingat' : 'Buka detail pengingat'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Check-In Action Button */}
      <div className="mt-3.5">
        <button
          onClick={handleClaimCheckIn}
          disabled={streak.checkedInToday}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            streak.checkedInToday
              ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20 cursor-default'
              : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-md shadow-orange-500/25 active:scale-98'
          }`}
        >
          {streak.checkedInToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Streak Hari Ini Tersimpan!</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Check-in & Jaga Streak Hari Ini</span>
            </>
          )}
        </button>
      </div>

      {/* 7-Day Activity Circles Track */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-semibold">
          <span>Aktivitas 7 Hari Pekan Ini</span>
          <span className="text-orange-400">
            {streak.weeklyActivity.filter((d) => d.checked).length}/7 Hari Aktif
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {streak.weeklyActivity.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl border transition-all ${
                day.isToday
                  ? day.checked
                    ? 'bg-orange-500/20 border-orange-500/50 ring-1 ring-orange-500/40'
                    : 'bg-slate-800/90 border-amber-400/80 animate-pulse'
                  : day.checked
                  ? 'bg-slate-800/60 border-slate-700/60'
                  : 'bg-slate-900/40 border-slate-800/40'
              }`}
            >
              <span
                className={`text-[9px] font-bold ${
                  day.isToday ? 'text-orange-300 font-extrabold' : 'text-slate-400'
                }`}
              >
                {day.dayLabel}
              </span>
              <div className="mt-1 flex items-center justify-center">
                {day.checked ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 fill-emerald-500/20" />
                  </div>
                ) : day.isToday ? (
                  <div className="w-4 h-4 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700 bg-slate-800/50" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Checklist & Smart Reminder Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Daily Tasks Checklist */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Target Disiplin Hari Ini</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  {completedTasksCount}/{totalTasks} ({progressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Task Items */}
              <div className="space-y-1.5">
                {streak.dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      task.completed
                        ? 'bg-slate-800/40 text-slate-300'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 text-slate-400 hover:text-white cursor-pointer">
                      {task.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                    <span
                      className={`leading-snug ${
                        task.completed ? 'line-through text-slate-400 font-normal' : 'font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Record Action shortcut */}
              {onOpenTransaction && (
                <button
                  onClick={onOpenTransaction}
                  className="mt-2.5 w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>+ Tambah Mutasi Hari Ini</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                </button>
              )}
            </div>

            {/* Smart Reminder Toggle Strip */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    streak.reminderEnabled
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {streak.reminderEnabled ? (
                    <Bell className="w-3.5 h-3.5" />
                  ) : (
                    <BellOff className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-200 block text-[11px]">
                    Pengingat Keuangan Harian
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Pukul {streak.reminderTime} WIB</span>
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleReminder}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  streak.reminderEnabled
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {streak.reminderEnabled ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
