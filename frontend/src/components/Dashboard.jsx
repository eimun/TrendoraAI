import { useState, useEffect } from 'react';
import axios from 'axios';


import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Activity, Maximize2, X, TrendingUp } from 'lucide-react';

function Dashboard() {
    const [niches] = useState(['tech', 'finance', 'lifestyle', 'health']);
    const [selectedNiche, setSelectedNiche] = useState('tech');
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTrends = async (niche) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/trends/fetch`,
                { niche },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTrends(response.data.trends);
        } catch (error) {
            console.error('Failed to fetch trends');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTrends(selectedNiche);
    }, [selectedNiche]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <TrendingUp className="text-purple-600 dark:text-purple-400 w-10 h-10" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Trending Topics Dashboard</h1>
                    </motion.div>

                    {/* Niche Selector */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 flex flex-wrap gap-4"
                    >
                        {niches.map(niche => (
                            <button
                                key={niche}
                                onClick={() => setSelectedNiche(niche)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm ${selectedNiche === niche
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30 shadow-lg scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {niche.charAt(0).toUpperCase() + niche.slice(1)}
                            </button>
                        ))}
                    </motion.div>



                    {/* Trends Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Activity className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                            </motion.div>
                        </div>
                    ) : trends.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                        >
                            <p className="text-2xl font-medium mb-2 text-gray-900 dark:text-gray-100">No trends found</p>
                            <p className="mb-6">Try selecting a different niche or refresh the page.</p>
                            <button
                                onClick={() => fetchTrends(selectedNiche)}
                                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-500/20 font-medium"
                            >
                                Retry Fetching
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {trends.map((trend, index) => (
                                <TrendCard key={index} trend={trend} />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TrendCard({ trend }) {
    const [showGenerator, setShowGenerator] = useState(false);

    // Mock realistic chart data based on volume and velocity
    const chartData = [
        { name: 'Day 1', volume: trend.volume * 0.3 },
        { name: 'Day 2', volume: trend.volume * 0.45 },
        { name: 'Day 3', volume: trend.volume * 0.4 },
        { name: 'Day 4', volume: trend.volume * 0.6 },
        { name: 'Day 5', volume: trend.volume * 0.8 },
        { name: 'Day 6', volume: trend.velocity === 'rising_fast' ? trend.volume * 1.5 : trend.volume * 0.9 },
        { name: 'Day 7', volume: trend.velocity === 'rising_fast' ? trend.volume * 2.1 : trend.volume },
    ];

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-green-400 to-green-600';
        if (score >= 60) return 'from-blue-400 to-blue-600';
        if (score >= 40) return 'from-yellow-400 to-yellow-600';
        return 'from-gray-400 to-gray-600';
    };

    const isHot = trend.velocity === 'rising_fast' || trend.velocity === 'breakout';

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-gray-700 group"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4 pr-16">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight capitalize">{trend.keyword}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isHot
                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                    {isHot ? '🔥 Hot' : '📈 Rising'}
                </span>
            </div>

            {/* Virality Score Badge */}
            <div className="absolute top-5 right-5 flex flex-col items-center">
                <div className={`bg-gradient-to-br ${getScoreColor(trend.virality_score)} text-white w-12 h-12 flex items-center justify-center rounded-full font-bold shadow-md`}>
                    {trend.virality_score || 0}
                </div>
            </div>

            <div className="mb-4 flex-grow">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                    Volume: <span className="text-gray-900 dark:text-white font-bold">{trend.volume?.toLocaleString()}</span> searches
                </p>

                {/* Mini Chart */}
                <div className="h-24 w-full -ml-2 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`colorVol-${trend.keyword}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isHot ? "#ef4444" : "#8b5cf6"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isHot ? "#ef4444" : "#8b5cf6"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="volume"
                                stroke={isHot ? "#ef4444" : "#8b5cf6"}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#colorVol-${trend.keyword})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Score Breakdown Bar */}
                {trend.virality_score > 0 && (
                    <div className="mt-2">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${trend.virality_score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${getScoreColor(trend.virality_score)}`}
                            />
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => setShowGenerator(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-xl hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-colors font-medium group-hover:shadow-md"
            >
                <Sparkles size={18} />
                Generate Content
            </button>

            <AnimatePresence>
                {showGenerator && (
                    <ContentGenerator keyword={trend.keyword} onClose={() => setShowGenerator(false)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ContentGenerator({ keyword, onClose }) {
    const [script, setScript] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useStyle, setUseStyle] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/generate/script`,
                { keyword, type: 'video', use_style: useStyle },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setScript(response.data);
        } catch (error) {
            alert('Generation failed');
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Content Strategy Built For</h2>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">{keyword}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 text-gray-500 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-xl p-4 flex items-center justify-between">
                    <label htmlFor="useStyle" className="flex items-center gap-3 cursor-pointer">
                        <span className="text-2xl">✨</span>
                        <div>
                            <span className="block font-semibold text-gray-900 dark:text-white">Use My Writing Style</span>
                            <span className="block text-sm text-gray-500 dark:text-gray-400">AI will analyze your trained models</span>
                        </div>
                    </label>
                    <input
                        type="checkbox"
                        id="useStyle"
                        checked={useStyle}
                        onChange={(e) => setUseStyle(e.target.checked)}
                        className="w-6 h-6 rounded border-gray-300 text-purple-600 focus:ring-purple-600 bg-white"
                    />
                </div>

                {!script && !loading ? (
                    <button
                        onClick={handleGenerate}
                        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-bold text-lg"
                    >
                        <Sparkles />
                        Generate Viral Script
                    </button>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                        </motion.div>
                        <p className="text-lg font-medium animate-pulse text-gray-600 dark:text-gray-300">Summoning the AI...</p>
                    </div>
                ) : script ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                                <Maximize2 size={16} /> The Hook
                            </h3>
                            <p className="text-gray-900 dark:text-white leading-relaxed text-lg">{script.script?.hook}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-2">Core Message</h3>
                            <p className="text-gray-900 dark:text-white leading-relaxed">{script.script?.body}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-2">Call to Action</h3>
                            <p className="text-gray-900 dark:text-white font-medium">{script.script?.cta}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase mb-3">Alternative Hooks</h3>
                            <div className="space-y-3">
                                {script.hooks?.map((hook, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 border-l-4 border-l-blue-500 p-3 rounded-r-lg shadow-sm">
                                        <p className="text-gray-800 dark:text-gray-200">{hook}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                            {script.hashtags?.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ) : null}
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;
