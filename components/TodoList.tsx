
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons/Icons';
import { useTranslation } from '../contexts/I18n';
import { useToast } from '../contexts/ToastContext';

const TaskModal: React.FC<{
    task: Task | null;
    onClose: () => void;
    onSave: (task: Task) => void;
}> = ({ task, onClose, onSave }) => {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
    const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.TODO);
    const { t } = useTranslation();

    const getPriorityText = (p: TaskPriority) => t(`todo.priorities.${p}`);
    const getStatusText = (s: TaskStatus) => t(`todo.statuses.${s.replace(' ', '')}`);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString();
        const savedTask: Task = {
            id: task?.id || Date.now().toString(),
            title,
            description,
            priority,
            status,
            createdAt: task?.createdAt || now,
        };
        onSave(savedTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-secondary p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{task ? t('todo.editTask') : t('todo.newTask')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('todo.taskTitle')}</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-600 focus:ring-accent focus:border-accent" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('todo.description')}</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-600 focus:ring-accent focus:border-accent h-24"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">{t('todo.priority')}</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full bg-primary p-2 rounded-md border border-gray-600 focus:ring-accent focus:border-accent">
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{getPriorityText(p)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">{t('todo.status')}</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="w-full bg-primary p-2 rounded-md border border-gray-600 focus:ring-accent focus:border-accent">
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{getStatusText(s)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700">{t('todo.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover">{t('todo.saveTask')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TodoList: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { tasks, setTasks } = appContext;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { t } = useTranslation();
    const { addToast } = useToast();

    const getPriorityText = (p: TaskPriority) => t(`todo.priorities.${p}`);
    const getStatusText = (s: TaskStatus) => t(`todo.statuses.${s.replace(' ', '')}`);

    const handleSaveTask = (task: Task) => {
        const isNew = !tasks.find(t => t.id === task.id);
        if (isNew) {
            setTasks([...tasks, task]);
        } else {
            setTasks(tasks.map(t => t.id === task.id ? task : t));
        }
        addToast(t('toast.taskSaved'), 'success');
    };
    
    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
        addToast(t('toast.taskDeleted'), 'info');
    };
    
    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    }
    
    const openNewModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    }

    const priorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.HIGH: return 'bg-red-500';
            case TaskPriority.MEDIUM: return 'bg-yellow-500';
            case TaskPriority.LOW: return 'bg-green-500';
        }
    };

    const priorityBorderColor = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.HIGH: return 'border-red-500';
            case TaskPriority.MEDIUM: return 'border-yellow-500';
            case TaskPriority.LOW: return 'border-green-500';
        }
    };

    const columns = useMemo(() => {
        const todo = tasks.filter(t => t.status === TaskStatus.TODO);
        const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
        const done = tasks.filter(t => t.status === TaskStatus.DONE);
        return {
            [TaskStatus.TODO]: todo,
            [TaskStatus.IN_PROGRESS]: inProgress,
            [TaskStatus.DONE]: done,
        };
    }, [tasks]);

    return (
        <div className="text-text-primary h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('todo.title')}</h1>
                <button onClick={openNewModal} className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                    <PlusIcon />
                    <span className="ms-2">{t('todo.newTask')}</span>
                </button>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
                {Object.values(TaskStatus).map(status => (
                    <div key={status} className="bg-secondary rounded-lg p-4 flex flex-col">
                        <h2 className="font-bold text-lg mb-4 text-center">{getStatusText(status)} ({columns[status].length})</h2>
                        <div className="flex-1 overflow-y-auto pe-2 space-y-4">
                            {columns[status].map(task => (
                                <div key={task.id} className={`bg-primary p-4 rounded-lg shadow-md border-s-4 ${priorityBorderColor(task.priority)} transition-all duration-200 hover:shadow-xl hover:transform hover:-translate-y-1`}>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-md mb-2">{task.title}</h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${priorityColor(task.priority)}`}>{getPriorityText(task.priority)}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary mb-3">{task.description}</p>
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => openEditModal(task)} className="p-2 text-text-secondary hover:text-accent transition-colors"><EditIcon /></button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-text-secondary hover:text-red-500 transition-colors"><TrashIcon /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <TaskModal task={editingTask} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} />}
        </div>
    );
};

export default TodoList;