
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Habit } from '../types';
import { PlusIcon, TrashIcon } from './icons/Icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, addDays, getDay, isToday, isSameMonth } from 'date-fns';
import { useTranslation } from '../contexts/I18n';
import { useToast } from '../contexts/ToastContext';

const HabitTracker: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { habits, setHabits } = appContext;

    const [newHabitName, setNewHabitName] = useState('');
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(habits.length > 0 ? habits[0] : null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { t } = useTranslation();
    const { addToast } = useToast();

    const handleAddHabit = () => {
        if (newHabitName.trim() === '') return;
        const newHabit: Habit = {
            id: Date.now().toString(),
            name: newHabitName,
            goal: 20,
            completions: {},
            createdAt: new Date().toISOString(),
        };
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        if(!selectedHabit) setSelectedHabit(newHabit);
        setNewHabitName('');
        addToast(t('toast.habitAdded'), 'success');
    };

    const handleDeleteHabit = (id: string) => {
        const updatedHabits = habits.filter(h => h.id !== id);
        setHabits(updatedHabits);
        if (selectedHabit?.id === id) {
            setSelectedHabit(updatedHabits.length > 0 ? updatedHabits[0] : null);
        }
        addToast(t('toast.habitDeleted'), 'info');
    };

    const toggleCompletion = (habitId: string, date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const updatedHabits = habits.map(habit => {
            if (habit.id === habitId) {
                const newCompletions = { ...habit.completions };
                if (newCompletions[dateKey]) {
                    delete newCompletions[dateKey];
                } else {
                    newCompletions[dateKey] = true;
                }
                const updatedHabit = { ...habit, completions: newCompletions };
                if(selectedHabit?.id === habitId) setSelectedHabit(updatedHabit);
                return updatedHabit;
            }
            return habit;
        });
        setHabits(updatedHabits);
    };
    
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
    }, [selectedHabit]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = [];
    let day = startDate;
    while(day <= endOfMonth(monthEnd)) {
        days.push(day);
        day = addDays(day, 1);
    }
    const weekDays = t('habit.weekdays').split(',');


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
                    <button onClick={handleAddHabit} className="bg-accent p-2 rounded-e-md transition-colors hover:bg-accent-hover"><PlusIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pe-2">
                    {habits.map(habit => (
                        <div key={habit.id} onClick={() => setSelectedHabit(habit)} className={`p-4 rounded-md cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedHabit?.id === habit.id ? 'bg-accent shadow-lg' : 'bg-primary hover:bg-opacity-75'}`}>
                            <div>
                                <p className="font-semibold">{habit.name}</p>
                                <p className="text-xs text-text-secondary">{t('habit.completions', { count: Object.keys(habit.completions).length })}</p>
                            </div>
                            <button onClick={(e) => {e.stopPropagation(); handleDeleteHabit(habit.id)}} className="text-text-secondary hover:text-red-500 p-1 transition-colors"><TrashIcon /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-secondary p-6 rounded-lg flex flex-col">
                {selectedHabit ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{selectedHabit.name}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-primary p-4 rounded-lg">
                                <p className="text-2xl font-bold">{streak}</p>
                                <p className="text-sm text-text-secondary">{t('habit.currentStreak')}</p>
                            </div>
                            <div className="bg-primary p-4 rounded-lg">
                                <p className="text-2xl font-bold">{Object.keys(selectedHabit.completions).filter(d => isSameMonth(parseISO(d), currentDate)).length}</p>
                                <p className="text-sm text-text-secondary">{t('habit.thisMonth')}</p>
                            </div>
                             <div className="bg-primary p-4 rounded-lg">
                                <p className="text-2xl font-bold">{Object.keys(selectedHabit.completions).length}</p>
                                <p className="text-sm text-text-secondary">{t('habit.totalCompletions')}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-4">{t('habit.calendarTitle')}</h3>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
                            {weekDays.map(day => <div key={day}>{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2 flex-1">
                            {days.map(d => {
                                const dateKey = format(d, 'yyyy-MM-dd');
                                const isCompleted = selectedHabit.completions[dateKey];
                                return (
                                <div
                                    key={dateKey}
                                    onClick={() => toggleCompletion(selectedHabit.id, d)}
                                    className={`
                                        ${!isSameMonth(d, currentDate) ? 'text-gray-600' : ''}
                                        ${isToday(d) ? 'border-2 border-accent' : ''}
                                        ${isCompleted ? 'bg-accent text-white' : 'bg-primary hover:bg-opacity-75'}
                                        w-full aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105
                                    `}
                                >
                                    {format(d, 'd')}
                                </div>
                            )})}
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