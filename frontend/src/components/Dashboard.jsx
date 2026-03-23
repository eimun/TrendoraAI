import { useState, useEffect } from 'react';
import axios from 'axios';


import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Bookmark, CheckCircle2 } from 'lucide-react';

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

    // Check preference
    const checkPreferenceAndFetch = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.default_niche) {
                setSelectedNiche(res.data.default_niche);
                fetchTrends(res.data.default_niche);
                return;
            }
        } catch (e) {
            console.error('Failed to get preferences, using default tech', e);
        }
        fetchTrends('tech');
    };

    useEffect(() => {
        checkPreferenceAndFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // This useEffect will run when selectedNiche changes,
        // including the initial change from checkPreferenceAndFetch
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
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const handleBookmark = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/bookmarks/`, {
                keyword: trend.keyword,
                volume: trend.volume || 1000,
                velocity: trend.velocity || 'normal'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsBookmarked(true);
            setToastMsg('Trend bookmarked!');
            setTimeout(() => setToastMsg(''), 3000);
        } catch (error) {
            console.error('Failed to bookmark trend:', error);
            setToastMsg('Already saved!');
            setTimeout(() => setToastMsg(''), 3000);
        }
    };

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
                onClick={handleBookmark}
                disabled={isBookmarked}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors font-medium ${isBookmarked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 group-hover:shadow-md'}`}
            >
                {isBookmarked ? <CheckCircle2 size={18} /> : <Bookmark size={18} />}
                {isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Trend'}
            </button>

            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap z-50"
                    >
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Dashboard;
