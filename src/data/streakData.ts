import { DailyStreakState } from '../types';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateWeeklyDays = (lastCheckInDate?: string) => {
  const todayStr = getTodayDateString();
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // 0 = Senin, 6 = Minggu
  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return dayLabels.map((label, idx) => {
    const diff = idx - currentDayIndex;
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + diff);
    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(
      dayDate.getDate()
    ).padStart(2, '0')}`;

    const isToday = dateStr === todayStr;
    const isPast = diff < 0;
    // Checked if it's past or if it's today and checked in
    const checked = isPast ? true : isToday ? lastCheckInDate === todayStr : false;

    return {
      dayLabel: label,
      date: dateStr,
      checked,
      isToday,
    };
  });
};

export const INITIAL_STREAK_STATE: DailyStreakState = {
  streakCount: 14,
  lastCheckInDate: getTodayDateString(),
  checkedInToday: true,
  bestStreak: 21,
  weeklyActivity: generateWeeklyDays(getTodayDateString()),
  dailyTasks: [
    {
      id: 'task_1',
      title: 'Periksa & catat mutasi pengeluaran hari ini',
      completed: true,
    },
    {
      id: 'task_2',
      title: 'Pantau sisa anggaran 50/30/20 & batas belanja harian',
      completed: true,
    },
    {
      id: 'task_3',
      title: 'Sisihkan tabungan atau verifikasi pertumbuhan FIRE',
      completed: false,
    },
  ],
  reminderEnabled: true,
  reminderTime: '20:00',
};
