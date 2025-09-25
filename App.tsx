
import React, { useState, useCallback, useEffect } from 'react';
import { View, Task, Habit, Note, PomodoroSession } from './types';
import { AppContext } from './contexts/AppContext';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import PomodoroTimer from './components/PomodoroTimer';
import TodoList from './components/TodoList';
import HabitTracker from './components/HabitTracker';
import Notebook from './components/Notebook';
import { I18nProvider } from './contexts/I18n';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.POMODORO);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>('pomodoroSessions', []);

  const renderView = () => {
    switch (activeView) {
      case View.POMODORO:
        return <PomodoroTimer />;
      case View.TODO_LIST:
        return <TodoList />;
      case View.HABIT_TRACKER:
        return <HabitTracker />;
      case View.NOTEBOOK:
        return <Notebook />;
      default:
        return <PomodoroTimer />;
    }
  };

  const appContextValue = {
    tasks,
    setTasks,
    habits,
    setHabits,
    notes,
    setNotes,
    sessions,
    setSessions,
  };

  return (
    <I18nProvider>
      <AppContext.Provider value={appContextValue}>
        <div className="flex h-screen bg-primary font-sans">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {renderView()}
          </main>
        </div>
      </AppContext.Provider>
    </I18nProvider>
  );
};

export default App;
