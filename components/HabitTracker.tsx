
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Habit } from '../types';
import { PlusIcon, TrashIcon } from './icons/Icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../contexts/I18n';


const HabitTracker: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { habits, setHabits } = appContext;

    const [newHabitName, setNewHabitName] = useState('');
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(habits.length > 0 ? habits[0] : null);
    const { t } = useTranslation();

    const handleAddHabit = () => {
        if (newHabitName.trim() === '') return;
        const newHabit: Habit = {
            id: Date.now().toString(),
            name: newHabitName,
            goal: 20, // default goal
            completions: {},
            createdAt: new Date().toISOString(),
        };
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        if(!selectedHabit) setSelectedHabit(newHabit);
        setNewHabitName('');
    };

    const handleDeleteHabit = (id: string) => {
        const updatedHabits = habits.filter(h => h.id !== id);
        setHabits(updatedHabits);
        if (selectedHabit?.id === id) {
            setSelectedHabit(updatedHabits.length > 0 ? updatedHabits[0] : null);
        }
    };

    const toggleCompletion = (habitId: string, date: string) => {
        setHabits(habits.map(habit => {
            if (habit.id === habitId) {
                const newCompletions = { ...habit.completions };
                if (newCompletions[date]) {
                    delete newCompletions[date];
                } else {
                    newCompletions[date] = true;
                }
                return { ...habit, completions: newCompletions };
            }
            return habit;
        }));
    };

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    const monthlyData = useMemo(() => {
        if (!selectedHabit) return [];
        const monthStart = startOfMonth(new Date());
        const days = eachDayOfInterval({start: monthStart, end: new Date()});
        
        return days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            return {
                name: format(day, 'dd'),
                completed: selectedHabit.completions[dateKey] ? 1 : 0
            };
        });
    }, [selectedHabit]);
    
    const currentMonthCompletions = selectedHabit ? Object.keys(selectedHabit.completions).filter(date => date.startsWith(format(new Date(), 'yyyy-MM'))).length : 0;
    const streak = useMemo(() => {
        if (!selectedHabit) return 0;
        let currentStreak = 0;
        let day = new Date();
        const dateKeys = Object.keys(selectedHabit.completions);
        
        while(dateKeys.includes(format(day, 'yyyy-MM-dd'))) {
            currentStreak++;
            day.setDate(day.getDate() - 1);
        }
        return currentStreak;
    }, [selectedHabit, habits]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full text-text-primary">
            <div className="lg:col-span-1 bg-secondary p-6 rounded-lg flex flex-col">
                <h2 className="text-2xl font-bold mb-4">{t('habit.yourHabits')}</h2>
                <div className="flex mb-4">
                    <input 
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder={t('habit.addHabitPlaceholder')}
                        className="flex-grow bg-primary p-2 rounded-s-md border border-gray-600 focus:ring-accent focus:border-accent"
                    />
                    <button onClick={handleAddHabit} className="bg-accent p-2 rounded-e-md"><PlusIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pe-2">
                    {habits.map(habit => (
                        <div key={habit.id} onClick={() => setSelectedHabit(habit)} className={`p-4 rounded-md cursor-pointer flex justify-between items-center transition-colors ${selectedHabit?.id === habit.id ? 'bg-accent' : 'bg-primary hover:bg-opacity-75'}`}>
                            <div>
                                <p className="font-semibold">{habit.name}</p>
                                <p className="text-xs text-text-secondary">{t('habit.completions', { count: Object.keys(habit.completions).length })}</p>
                            </div>
                            <button onClick={(e) => {e.stopPropagation(); handleDeleteHabit(habit.id)}} className="text-text-secondary hover:text-red-500 p-1"><TrashIcon /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-secondary p-6 rounded-lg flex flex-col">
                {selectedHabit ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{selectedHabit.name}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                            <div className="bg-primary p-4 rounded-lg">
                                <p className="text-2xl font-bold">{streak}</p>
                                <p className="text-sm text-text-secondary">{t('habit.currentStreak')}</p>
                            </div>
                            <div className="bg-primary p-4 rounded-lg">
                                <p className="text-2xl font-bold">{currentMonthCompletions}</p>
                                <p className="text-sm text-text-secondary">{t('habit.thisMonth')}</p>
                            </div>
                             <div className="bg-primary p-4 rounded-lg">
                                <p className="text-2xl font-bold">{Object.keys(selectedHabit.completions).length}</p>
                                <p className="text-sm text-text-secondary">{t('habit.totalCompletions')}</p>
                            </div>
                            <div className="bg-primary p-4 rounded-lg">
                                <div className="flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        id={`today-${selectedHabit.id}`} 
                                        checked={!!selectedHabit.completions[todayStr]} 
                                        onChange={() => toggleCompletion(selectedHabit.id, todayStr)}
                                        className="w-6 h-6 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
                                    />
                                    <label htmlFor={`today-${selectedHabit.id}`} className="ms-3 text-lg font-medium">{t('habit.doneToday')}</label>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-4">{t('habit.monthlyProgress')}</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a4a6a" />
                                    <XAxis dataKey="name" stroke="#a0a0a0" />
                                    <YAxis hide={true} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1d2e', border: 'none' }} cursor={{fill: '#272a44'}} />
                                    <Bar dataKey="completed" fill="#6366f1" maxBarSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-text-secondary">{t('habit.selectHabit')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitTracker;
