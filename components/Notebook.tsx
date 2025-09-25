
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Note } from '../types';
import { PlusIcon, TrashIcon } from './icons/Icons';
import { format } from 'date-fns';
import { useTranslation } from '../contexts/I18n';
import { useToast } from '../contexts/ToastContext';
import { parseMarkdown } from '../utils/markdownParser';

const Notebook: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { notes, setNotes } = appContext;
    const { t } = useTranslation();
    const { addToast } = useToast();

    const [selectedNote, setSelectedNote] = useState<Note | null>(notes.length > 0 ? notes[0] : null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!selectedNote && notes.length > 0) {
            setSelectedNote(notes[0]);
        }
         if (selectedNote && !notes.find(n => n.id === selectedNote.id)) {
            setSelectedNote(notes.length > 0 ? notes[0] : null);
        }
    }, [notes, selectedNote]);

    const createNewNote = () => {
        const now = new Date().toISOString();
        const newNote: Note = {
            id: Date.now().toString(),
            title: t('notes.newNote'),
            content: `# ${t('notes.newNote')}\n\n`,
            tags: [],
            createdAt: now,
            updatedAt: now
        };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setSelectedNote(newNote);
        addToast(t('toast.noteCreated'), 'success');
    };
    
    const deleteNote = (id: string) => {
        const updatedNotes = notes.filter(n => n.id !== id);
        setNotes(updatedNotes);
        addToast(t('toast.noteDeleted'), 'info');
    }
    
    const updateNoteContent = (content: string) => {
        if (!selectedNote) return;
        
        const now = new Date().toISOString();
        const updatedNote = { ...selectedNote, content, updatedAt: now };
        
        const titleMatch = content.match(/^# (.*)/);
        updatedNote.title = titleMatch ? titleMatch[1] : t('notes.untitledNote');

        setSelectedNote(updatedNote);
        setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));
    };

    const renderedMarkdown = useMemo(() => {
        if (selectedNote) {
            return parseMarkdown(selectedNote.content);
        }
        return '';
    }, [selectedNote?.content]);
    
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full text-text-primary">
            <div className="md:col-span-1 lg:col-span-1 bg-secondary p-4 rounded-lg flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('notes.title')}</h2>
                    <button onClick={createNewNote} className="p-2 text-accent hover:bg-primary rounded-full transition-colors"><PlusIcon /></button>
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
                            className={`p-3 rounded-md cursor-pointer transition-colors ${selectedNote?.id === note.id ? 'bg-accent' : 'bg-primary hover:bg-opacity-75'}`}
                        >
                            <h3 className="font-semibold truncate">{note.title}</h3>
                            <p className="text-xs text-text-secondary">{format(new Date(note.updatedAt), 'MMM d, yyyy')}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 bg-secondary rounded-lg flex flex-col h-full overflow-hidden">
                {selectedNote ? (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-primary">
                            <div>
                                <h2 className="text-xl font-bold truncate">{selectedNote.title}</h2>
                                <p className="text-xs text-text-secondary">{t('notes.lastUpdated', { date: format(new Date(selectedNote.updatedAt), 'PPp') })}</p>
                            </div>
                            <button onClick={() => deleteNote(selectedNote.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-full transition-colors"><TrashIcon /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
                            <div className="flex flex-col h-full">
                                <h3 className="text-sm font-bold p-2 bg-primary text-text-secondary">{t('notes.editor')}</h3>
                                <textarea
                                    value={selectedNote.content}
                                    onChange={(e) => updateNoteContent(e.target.value)}
                                    className="w-full h-full bg-secondary text-text-primary p-4 focus:outline-none resize-none font-mono"
                                    placeholder={t('notes.editorPlaceholder')}
                                ></textarea>
                            </div>
                             <div className="hidden md:flex flex-col h-full border-s border-primary">
                                <h3 className="text-sm font-bold p-2 bg-primary text-text-secondary">{t('notes.preview')}</h3>
                                <div 
                                    className="prose prose-invert p-4 overflow-y-auto h-full"
                                    dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                                />
                            </div>
                        </div>
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