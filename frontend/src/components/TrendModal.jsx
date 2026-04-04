import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Bookmark, CheckCircle2, TrendingUp, Sparkles, MessageSquarePlus, RefreshCw, Copy, Search } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function TrendModal({ trend, isBookmarked, onClose, onBookmarkChange }) {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(true);

    const fetchAISummary = useCallback(async () => {
        if (!trend) return;
        setIsAiLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/trends/analyze`, {
                keyword: trend.keyword,
                niche: trend.niche,
                volume: trend.volume,
                velocity: trend.velocity
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setAiSummary(response.data.summary);
        } catch (error) {
            console.error("Failed to fetch AI summary:", error);
            setAiSummary("We couldn't generate an AI summary for this trend at the moment. Please try again later.");
        } finally {
            setIsAiLoading(false);
        }
    }, [trend]);

    useEffect(() => {
        fetchAISummary();
    }, [fetchAISummary]);

    const handleCopySummary = () => {
        if (!aiSummary) return;
        navigator.clipboard.writeText(aiSummary);
        setToastMsg('Copied to clipboard!');
        setTimeout(() => setToastMsg(''), 2000);
    };

    if (!trend) return null;

    const isHot = trend.velocity === 'rising_fast' || trend.velocity === 'breakout';

    const handleOverlayClick = (e) => {
        if (e.target.id === 'modal-overlay') onClose();
    };

    const handleSave = async () => {
        if (isBookmarked) return;
        setSaving(true);
        setToastMsg('Saving...');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/bookmarks/`, {
                keyword: trend.keyword,
                volume: trend.volume || 1000,
                velocity: trend.velocity || 'normal'
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            onBookmarkChange(trend.keyword);
            setToastMsg('Saved successfully!');
        } catch (error) {
            if (error.response?.status === 400) {
                onBookmarkChange(trend.keyword);
                setToastMsg('Already saved!');
            } else {
                setToastMsg('Failed to save');
            }
        }
        setSaving(false);
        setTimeout(() => setToastMsg(''), 2000);
    };

    const handleAddNote = async () => {
        if (!isBookmarked) {
            await handleSave();
        }
        // Navigate to saved trends to let them write the note
        navigate('/saved-trends');
    };

    return (
        <div id="modal-overlay" onClick={handleOverlayClick} className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div 
                initial={{ x: '100%', opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: '100%', opacity: 0 }} 
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header Container inside scroll area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors z-10">
                        <X size={20} />
                    </button>

                    <div className="mt-8 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            {trend.niche && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 capitalize">
                                    {trend.niche}
                                </span>
                            )}
                            {isHot && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
                                    <TrendingUp size={14} /> HOT TREND
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white capitalize leading-tight">
                            {trend.keyword}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Search Volume</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{trend.volume.toLocaleString()}+</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Virality Score</p>
                            <div className="flex items-baseline gap-1">
                                <p className={`text-2xl font-black ${
                                    (trend.virality_score || 0) >= 80 ? 'text-red-500' :
                                    (trend.virality_score || 0) >= 50 ? 'text-orange-500' :
                                    'text-emerald-500'
                                }`}>{trend.virality_score || 0}</p>
                                <span className="text-sm font-bold text-gray-400">/ 100</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Sparkles size={18} className="text-purple-500" /> AI Trend Summary
                        </h3>
                        <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 p-5 rounded-2xl min-h-[100px] relative group/ai overflow-hidden">
                            {isAiLoading ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-4 bg-purple-200/50 dark:bg-purple-800/30 rounded w-full"></div>
                                    <div className="h-4 bg-purple-200/50 dark:bg-purple-800/30 rounded w-11/12"></div>
                                    <div className="h-4 bg-purple-200/50 dark:bg-purple-800/30 rounded w-4/5"></div>
                                </div>
                            ) : (
                                <>
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm"
                                    >
                                        {aiSummary}
                                    </motion.p>
                                    
                                    {aiSummary && !aiSummary.includes("couldn't generate") && (
                                        <button 
                                            onClick={handleCopySummary}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 opacity-0 group-hover/ai:opacity-100 transition-all border border-purple-100/50 dark:border-purple-800/30"
                                            title="Copy Summary"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    )}

                                    {aiSummary && aiSummary.includes("couldn't generate") && (
                                        <button 
                                            onClick={fetchAISummary}
                                            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                        >
                                            <RefreshCw size={12} /> Try Again
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <a 
                                href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(trend.keyword)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold transition-colors text-sm"
                            >
                                <TrendingUp size={16} /> Google Trends
                            </a>
                            <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(trend.keyword)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl font-bold transition-colors text-sm"
                            >
                                <Search size={16} /> Web Search
                            </a>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSave}
                                disabled={isBookmarked || saving}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-colors ${
                                    isBookmarked 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-default'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20'
                                }`}
                            >
                                {isBookmarked ? <CheckCircle2 size={18} /> : <Bookmark size={18} />}
                                {isBookmarked ? 'Saved to Bookmarks' : (saving ? 'Saving...' : 'Save Trend')}
                            </button>
                            
                            <button 
                                onClick={handleAddNote}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-gray-900 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-bold transition-colors"
                            >
                                <MessageSquarePlus size={18} /> Add Note
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {toastMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-xl text-sm font-bold whitespace-nowrap"
                        >
                            {toastMsg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default TrendModal;
