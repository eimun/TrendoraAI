import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, TrendingUp, Edit3, Trash2, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

function SavedTrends() {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [message, setMessage] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchSavedTrends();
    }, []);

    const fetchSavedTrends = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/bookmarks/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrends(res.data.trends);
        } catch (error) {
            console.error('Error fetching trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrend = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/bookmarks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrends(trends.filter(t => t.id !== id));
            setConfirmDeleteId(null);
            showMsg('Trend deleted');
        } catch (e) {
            console.error('Delete failed:', e);
            setConfirmDeleteId(null);
            const msg = e.response?.data?.error || 'Failed to delete trend';
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    const handleAddNote = async (trendId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/notes/${trendId}`, {
                note_text: 'New note...'
            }, { headers: { Authorization: `Bearer ${token}` } });

            setTrends(trends.map(t => {
                if (t.id === trendId) {
                    return { ...t, notes: [...t.notes, res.data.note] };
                }
                return t;
            }));
            setEditingNoteId(res.data.note.id);
            setNoteDraft('New note...');
        } catch (e) {
            console.error('Add note failed:', e);
        }
    };

    const handleUpdateNote = async (trendId, noteId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/notes/${noteId}`, {
                note_text: noteDraft
            }, { headers: { Authorization: `Bearer ${token}` } });

            setTrends(trends.map(t => {
                if (t.id === trendId) {
                    const updatedNotes = t.notes.map(n => n.id === noteId ? { ...n, note_text: noteDraft } : n);
                    return { ...t, notes: updatedNotes };
                }
                return t;
            }));
            setEditingNoteId(null);
            showMsg('Note saved');
        } catch (e) {
            console.error('Update note failed:', e);
        }
    };

    const handleDeleteNote = async (trendId, noteId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrends(trends.map(t => {
                if (t.id === trendId) {
                    return { ...t, notes: t.notes.filter(n => n.id !== noteId) };
                }
                return t;
            }));
        } catch (e) {
            console.error('Delete note failed:', e);
        }
    };

    const showMsg = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pt-20">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Bookmark className="text-purple-500" /> My Saved Trends
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your bookmarked topics and attach content ideas.</p>
                </div>
                {message && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg font-semibold text-sm">
                        <CheckCircle2 size={16} /> {message}
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg font-semibold text-sm">
                        ⚠️ {errorMsg}
                    </motion.div>
                )}
            </div>

            {trends.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Bookmark size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">No saved trends yet</h2>
                    <p className="text-gray-400">Go to your Dashboard and bookmark a trend to see it here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {trends.map(trend => (
                        <motion.div
                            key={trend.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                        >
                            {/* Trend Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                                        <TrendingUp size={20} className="text-emerald-500" /> {trend.keyword}
                                    </h3>
                                    <div className="text-sm text-gray-500 flex gap-4">
                                        <span>Volume: {trend.volume}</span>
                                        <span className="capitalize">Velocity: {trend.velocity}</span>
                                        <span>Saved: {new Date(trend.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddNote(trend.id)} className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors" title="Add Note">
                                        <MessageSquarePlus size={20} />
                                    </button>
                                    {confirmDeleteId === trend.id ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Delete?</span>
                                            <button
                                                onClick={() => handleDeleteTrend(trend.id)}
                                                className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >Yes</button>
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="px-2 py-1 text-xs font-bold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                                            >No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmDeleteId(trend.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Trend">
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="p-6">
                                <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Content Notes & Ideas</h4>
                                {trend.notes.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No notes attached yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {trend.notes.map(note => (
                                            <div key={note.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                {editingNoteId === note.id ? (
                                                    <div>
                                                        <textarea
                                                            value={noteDraft}
                                                            onChange={(e) => setNoteDraft(e.target.value)}
                                                            className="w-full bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none mb-3"
                                                            rows="3"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                                                            <button onClick={() => handleUpdateNote(trend.id, note.id)} className="px-3 py-1.5 text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.note_text}</p>
                                                        <div className="flex gap-1 ml-4 shrink-0">
                                                            <button
                                                                onClick={() => { setEditingNoteId(note.id); setNoteDraft(note.note_text); }}
                                                                className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNote(trend.id, note.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedTrends;
