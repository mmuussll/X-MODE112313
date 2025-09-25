
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Note } from '../types';
import { PlusIcon, TrashIcon } from './icons/Icons';
import { format } from 'date-fns';
import { useTranslation } from '../contexts/I18n';

const Notebook: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { notes, setNotes } = appContext;
    const { t } = useTranslation();

    const [selectedNote, setSelectedNote] = useState<Note | null>(notes.length > 0 ? notes[0] : null);
    const [searchTerm, setSearchTerm] = useState('');

    const createNewNote = () => {
        const now = new Date().toISOString();
        const newNote: Note = {
            id: Date.now().toString(),
            title: t('notes.newNote'),
            content: '',
            tags: [],
            createdAt: now,
            updatedAt: now
        };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setSelectedNote(newNote);
    };
    
    const deleteNote = (id: string) => {
        const updatedNotes = notes.filter(n => n.id !== id);
        setNotes(updatedNotes);
        if (selectedNote?.id === id) {
            setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
        }
    }
    
    const updateNoteContent = (content: string) => {
        if (!selectedNote) return;
        
        const updatedNote = { ...selectedNote, content, updatedAt: new Date().toISOString() };
        
        const titleMatch = content.match(/^# (.*)/);
        updatedNote.title = titleMatch ? titleMatch[1] : t('notes.untitledNote');

        setSelectedNote(updatedNote);
        setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));
    };
    
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full text-text-primary">
            <div className="md:col-span-1 lg:col-span-1 bg-secondary p-4 rounded-lg flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('notes.title')}</h2>
                    <button onClick={createNewNote} className="p-2 text-accent hover:bg-primary rounded-full"><PlusIcon /></button>
                </div>
                <input 
                    type="text"
                    placeholder={t('notes.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-primary p-2 rounded-md border border-gray-600 mb-4"
                />
                <div className="flex-1 overflow-y-auto pe-2 space-y-2">
                    {filteredNotes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`p-3 rounded-md cursor-pointer ${selectedNote?.id === note.id ? 'bg-accent' : 'bg-primary hover:bg-opacity-75'}`}
                        >
                            <h3 className="font-semibold truncate">{note.title}</h3>
                            <p className="text-xs text-text-secondary">{format(new Date(note.updatedAt), 'MMM d, yyyy')}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 bg-secondary p-4 rounded-lg flex flex-col h-full">
                {selectedNote ? (
                    <>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                                <p className="text-xs text-text-secondary">{t('notes.lastUpdated', { date: format(new Date(selectedNote.updatedAt), 'PPpp') })}</p>
                            </div>
                            <button onClick={() => deleteNote(selectedNote.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-full"><TrashIcon /></button>
                        </div>
                        <textarea
                            value={selectedNote.content}
                            onChange={(e) => updateNoteContent(e.target.value)}
                            className="w-full h-full bg-secondary text-text-primary p-2 focus:outline-none resize-none"
                            placeholder={t('notes.editorPlaceholder')}
                        ></textarea>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-text-secondary">{t('notes.selectNote')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notebook;
