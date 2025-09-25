
import React from 'react';
import { View } from '../types';
import { TimerIcon, ChecklistIcon, CalendarIcon, NotebookIcon } from './icons/Icons';
import { useTranslation } from '../contexts/I18n';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: View;
  activeView: View;
  onClick: (view: View) => void;
}> = ({ icon, label, view, activeView, onClick }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center justify-center lg:justify-start w-full p-3 my-1 rounded-lg transition-all duration-200 ${
        isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
      }`}
      aria-label={label}
    >
      {icon}
      <span className="hidden lg:inline lg:ms-4 text-sm font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { t, locale, setLocale } = useTranslation();

  return (
    <aside className="w-16 lg:w-56 bg-secondary p-2 lg:p-4 flex flex-col">
      <div className="flex items-center justify-center lg:justify-start mb-8">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-white">Z</div>
        <h1 className="hidden lg:inline text-xl font-bold lg:ms-3 text-text-primary">{t('zenith')}</h1>
      </div>
      <nav className="flex-1">
        <NavItem icon={<TimerIcon />} label={t('pomodoro')} view={View.POMODORO} activeView={activeView} onClick={setActiveView} />
        <NavItem icon={<ChecklistIcon />} label={t('todoList')} view={View.TODO_LIST} activeView={activeView} onClick={setActiveView} />
        <NavItem icon={<CalendarIcon />} label={t('habitTracker')} view={View.HABIT_TRACKER} activeView={activeView} onClick={setActiveView} />
        <NavItem icon={<NotebookIcon />} label={t('notebook')} view={View.NOTEBOOK} activeView={activeView} onClick={setActiveView} />
      </nav>
      <div className="mt-auto">
        <div className="flex justify-center space-x-2 mb-4">
          <button 
            onClick={() => setLocale('en')}
            className={`px-3 py-1 text-xs rounded transition-colors ${locale === 'en' ? 'bg-accent text-white' : 'bg-primary text-text-secondary hover:bg-opacity-75'}`}
            aria-pressed={locale === 'en'}
          >EN</button>
          <button 
            onClick={() => setLocale('ar')}
            className={`px-3 py-1 text-xs rounded transition-colors ${locale === 'ar' ? 'bg-accent text-white' : 'bg-primary text-text-secondary hover:bg-opacity-75'}`}
            aria-pressed={locale === 'ar'}
          >AR</button>
        </div>
        <div className="hidden lg:block text-center text-xs text-text-secondary">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
