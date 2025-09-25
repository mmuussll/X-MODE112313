
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { useTranslation } from '../contexts/I18n';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoros, setPomodoros] = useState(0);
  
  const { t } = useTranslation();
  const appContext = useContext(AppContext);
  if (!appContext) return null;
  const { sessions, setSessions } = appContext;
  
  const timerSettings = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  };

  const switchMode = useCallback((newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(timerSettings[newMode]);
    setSeconds(0);
  }, [timerSettings]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          if (mode === 'work') {
            const today = format(new Date(), 'yyyy-MM-dd');
            setSessions(prev => [...prev, { id: Date.now().toString(), date: today, duration: timerSettings.work }]);
            setPomodoros(pomodoros + 1);
            if ((pomodoros + 1) % 4 === 0) {
              switchMode('longBreak');
            } else {
              switchMode('shortBreak');
            }
          } else {
            switchMode('work');
          }
          if (Notification.permission === 'granted') {
            new Notification('Zenith Focus', {
              body: mode === 'work' ? t('pomodoroTimer.notificationBreak') : t('pomodoroTimer.notificationWork'),
            });
          }
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if(interval) clearInterval(interval);
    }
    return () => {
      if(interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, mode, pomodoros, setSessions, switchMode, timerSettings.work, t]);
  
  const toggle = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setMinutes(timerSettings[mode]);
    setSeconds(0);
  };

  const totalSeconds = timerSettings[mode] * 60;
  const elapsedSeconds = (timerSettings[mode] * 60) - (minutes * 60 + seconds);
  const progress = (elapsedSeconds / totalSeconds) * 100;
  
  const getMonthlyData = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    const sessionsByDay = sessions.reduce((acc, session) => {
        const day = format(parseISO(session.date), 'dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});
    
    return daysInMonth.map(day => ({
        name: format(day, 'dd'),
        sessions: sessionsByDay[format(day, 'dd')] || 0,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-text-primary">
      <div className="w-full max-w-md bg-secondary p-8 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center space-x-2 mb-6">
          <button onClick={() => switchMode('work')} className={`px-4 py-2 rounded-lg transition-colors ${mode === 'work' ? 'bg-accent' : 'bg-primary hover:bg-opacity-75'}`}>{t('pomodoroTimer.work')}</button>
          <button onClick={() => switchMode('shortBreak')} className={`px-4 py-2 rounded-lg transition-colors ${mode === 'shortBreak' ? 'bg-accent' : 'bg-primary hover:bg-opacity-75'}`}>{t('pomodoroTimer.shortBreak')}</button>
          <button onClick={() => switchMode('longBreak')} className={`px-4 py-2 rounded-lg transition-colors ${mode === 'longBreak' ? 'bg-accent' : 'bg-primary hover:bg-opacity-75'}`}>{t('pomodoroTimer.longBreak')}</button>
        </div>
        <div className="relative w-64 h-64 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="text-primary" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
            <circle
              className="text-accent"
              strokeWidth="7"
              strokeDasharray="283"
              strokeDashoffset={283 - (progress / 100) * 283}
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button onClick={toggle} className="w-32 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-lg transition-colors">
            {isActive ? t('pomodoroTimer.pause') : t('pomodoroTimer.start')}
          </button>
          <button onClick={reset} className="w-32 bg-primary hover:bg-opacity-75 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            {t('pomodoroTimer.reset')}
          </button>
        </div>
        <p className="mt-6 text-text-secondary">{t('pomodoroTimer.completedToday', { count: sessions.filter(s => s.date === format(new Date(), 'yyyy-MM-dd')).length })}</p>
      </div>
      
      <div className="w-full max-w-4xl bg-secondary p-6 rounded-2xl shadow-lg mt-8">
        <h2 className="text-xl font-bold mb-4">{t('pomodoroTimer.monthlySessions')}</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a4a6a" />
                <XAxis dataKey="name" stroke="#a0a0a0" />
                <YAxis allowDecimals={false} stroke="#a0a0a0" />
                <Tooltip contentStyle={{ backgroundColor: '#272a44', border: 'none' }}/>
                <Legend />
                <Bar dataKey="sessions" name={t('pomodoroTimer.sessions')} fill="#6366f1" />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PomodoroTimer;
