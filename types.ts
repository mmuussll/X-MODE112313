
export enum View {
  POMODORO = 'POMODORO',
  TODO_LIST = 'TODO_LIST',
  HABIT_TRACKER = 'HABIT_TRACKER',
  NOTEBOOK = 'NOTEBOOK',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  goal: number; // days per month
  completions: { [date: string]: boolean }; // YYYY-MM-DD
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface AppContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  sessions: PomodoroSession[];
  setSessions: React.Dispatch<React.SetStateAction<PomodoroSession[]>>;
}