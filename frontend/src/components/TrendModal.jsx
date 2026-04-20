import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { X, Bookmark, CheckCircle2, TrendingUp, Sparkles, MessageSquarePlus, Copy, Search, Zap, Lightbulb, Hash } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function TrendModal({ trend, isBookmarked, onClose, onBookmarkChange }) {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

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
            
            setAiAnalysis(response.data);
        } catch (error) {
            console.error("Failed to fetch AI analysis:", error);
            setAiAnalysis({ summary: "We couldn't generate an AI summary for this trend at the moment.", ideas: [], keywords: [] });
        } finally {
            setIsAiLoading(false);
        }
    }, [trend]);

    useEffect(() => {
        fetchAISummary();
    }, [fetchAISummary]);

    const handleCopySummary = () => {
        if (!aiAnalysis?.summary) return;
        navigator.clipboard.writeText(aiAnalysis.summary);
        setToastMsg('Copied to clipboard!');
        setTimeout(() => setToastMsg(''), 2000);
    };

    if (!trend) return null;

    const isHot = trend.velocity === 'rising_fast' || trend.velocity === 'breakout';

    const chartData = [
        { name: 'Day 1', volume: trend.volume * 0.3 },
        { name: 'Day 2', volume: trend.volume * 0.45 },
        { name: 'Day 3', volume: trend.volume * 0.4 },
        { name: 'Day 4', volume: trend.volume * 0.6 },
        { name: 'Day 5', volume: trend.volume * 0.8 },
        { name: 'Day 6', volume: isHot ? trend.volume * 1.5 : trend.volume * 0.9 },
        { name: 'Day 7', volume: isHot ? trend.volume * 2.1 : trend.volume },
    ];

    const formatVolume = (vol) => {
        if (!vol) return 'N/A';
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M+`;
        if (vol >= 1000) return `${Math.floor(vol / 1000)}K+`;
        return `${vol}+`;
    };

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
        navigate('/saved-trends');
    };

    return (
        <div id="modal-overlay" onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10"
            >
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors z-10">
                        <X size={20} />
                    </button>

                    <div className="mb-6">
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

                    <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Data Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab('ideas')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 flex justify-center items-center gap-2 ${activeTab === 'ideas' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Sparkles size={16} /> AI Toolkit
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="h-32 w-full bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 pb-0 relative">
                                <div className="absolute top-4 left-4 z-10">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">7-Day Momentum</p>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isHot ? "#ef4444" : "#10b981"} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={isHot ? "#ef4444" : "#10b981"} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="volume"
                                            stroke={isHot ? "#ef4444" : "#10b981"}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorVol)"
                                            isAnimationActive={true}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Search Volume</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{formatVolume(trend.volume)}</p>
                                    <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                                        <Search size={64} />
                                    </div>
                                </div>
                                <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
                                    (trend.virality_score || 0) >= 80 ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' :
                                    (trend.virality_score || 0) >= 50 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30' :
                                    'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                }`}>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                                        (trend.virality_score || 0) >= 80 ? 'text-red-500/80 dark:text-red-400/80' :
                                        (trend.virality_score || 0) >= 50 ? 'text-orange-500/80 dark:text-orange-400/80' :
                                        'text-emerald-500/80 dark:text-emerald-400/80'
                                    }`}>Virality Score</p>
                                    <div className="flex items-baseline gap-1 relative z-10">
                                        <p className={`text-3xl font-black ${
                                            (trend.virality_score || 0) >= 80 ? 'text-red-600 dark:text-red-400' :
                                            (trend.virality_score || 0) >= 50 ? 'text-orange-600 dark:text-orange-400' :
                                            'text-emerald-600 dark:text-emerald-400'
                                        }`}>{trend.virality_score || 0}</p>
                                        <span className={`text-sm font-bold ${
                                            (trend.virality_score || 0) >= 80 ? 'text-red-400/50 dark:text-red-500/40' :
                                            (trend.virality_score || 0) >= 50 ? 'text-orange-400/50 dark:text-orange-500/40' :
                                            'text-emerald-400/50 dark:text-emerald-500/40'
                                        }`}>/ 100</span>
                                    </div>
                                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-3 translate-y-3 text-current">
                                        <Zap size={64} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">AI Context</h3>
                                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 p-5 rounded-2xl min-h-[80px] relative group/ai">
                                    {isAiLoading ? (
                                        <div className="space-y-2 animate-pulse">
                                            <div className="h-4 bg-purple-200/50 dark:bg-purple-800/30 rounded w-full"></div>
                                            <div className="h-4 bg-purple-200/50 dark:bg-purple-800/30 rounded w-11/12"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                                {aiAnalysis?.summary || "No summary available."}
                                            </motion.p>
                                            {aiAnalysis?.summary && (
                                                <button onClick={handleCopySummary} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 opacity-0 group-hover/ai:opacity-100 transition-all border border-purple-100/50 dark:border-purple-800/30" title="Copy Context">
                                                    <Copy size={14} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ideas' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {isAiLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Sparkles className="animate-pulse mb-3" size={32} />
                                    <p className="text-sm font-bold">Llama 3 is brainstorming ideas...</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Lightbulb size={16} className="text-yellow-500" />
                                            Content Creation Hooks
                                        </h3>
                                        <div className="space-y-3">
                                            {aiAnalysis?.ideas?.map((idea, idx) => (
                                                <div key={idx} className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                                                    {idea}
                                                </div>
                                            )) || (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm text-gray-500 text-center">
                                                    No ideas generated. Try again later.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Hash size={16} className="text-blue-500" />
                                            Target Keywords
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {aiAnalysis?.keywords?.map((kw, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-900/30">
                                                    {kw}
                                                </span>
                                            )) || (
                                                <span className="text-sm text-gray-500">None generated.</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    <div className="mt-8 space-y-3">
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
                                {isBookmarked ? 'Saved' : (saving ? 'Saving...' : 'Bookmark')}
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
