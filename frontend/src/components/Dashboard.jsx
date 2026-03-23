import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Bookmark, CheckCircle2, ChevronDown, Globe, Clock, Filter, BarChart3, Zap } from 'lucide-react';

/* ───────── Constants ───────── */
const LOCATIONS = [
    { code: 'US', label: '🇺🇸 United States' },
    { code: 'IN', label: '🇮🇳 India' },
    { code: 'GB', label: '🇬🇧 United Kingdom' },
    { code: 'CA', label: '🇨🇦 Canada' },
    { code: 'AU', label: '🇦🇺 Australia' },
    { code: 'DE', label: '🇩🇪 Germany' },
    { code: 'FR', label: '🇫🇷 France' },
    { code: 'JP', label: '🇯🇵 Japan' },
    { code: 'BR', label: '🇧🇷 Brazil' },
];

const CATEGORIES = [
    { value: 'all', label: 'All categories' },
    { value: 'tech', label: 'Tech & AI' },
    { value: 'finance', label: 'Business & Finance' },
    { value: 'health', label: 'Health' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
];

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'volume_desc', label: 'Search volume ↓' },
    { value: 'volume_asc', label: 'Search volume ↑' },
    { value: 'title', label: 'Title (A-Z)' },
];

const TREND_STATUS = [
    { value: 'all', label: 'All trends' },
    { value: 'hot', label: '🔥 Hot only' },
    { value: 'rising', label: '📈 Rising only' },
];

/* ───────── Dropdown Component ───────── */
function FilterDropdown({ icon: Icon, value, options, onChange, accent }) {
    return (
        <div className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
            cursor-pointer transition-all duration-200 hover:shadow-md
            ${accent
                ? 'bg-purple-600 text-white shadow-purple-500/20 shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
            }`}
        >
            <Icon size={15} className={accent ? 'text-purple-200' : 'text-gray-400 dark:text-gray-300'} />
            <select
                className={`bg-transparent outline-none cursor-pointer appearance-none pr-4 font-semibold text-sm
                    ${accent ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
                {options.map(opt => (
                    <option
                        key={opt.value || opt.code}
                        value={opt.value || opt.code}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={13} className={`absolute right-3 pointer-events-none ${accent ? 'text-purple-200' : 'text-gray-400 dark:text-gray-400'}`} />
        </div>
    );
}

/* ───────── Main Dashboard ───────── */
function Dashboard() {
    const [geo, setGeo] = useState('US');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [trendStatus, setTrendStatus] = useState('all');
    const [allTrends, setAllTrends] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTrends = async (niche, geoCode) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/trends/fetch`,
                { niche, geo: geoCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllTrends(response.data.trends);
        } catch (error) {
            console.error('Failed to fetch trends');
        }
        setLoading(false);
    };

    // On mount: check user preference
    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.default_niche) {
                    setCategory(res.data.default_niche);
                    fetchTrends(res.data.default_niche, geo);
                    return;
                }
            } catch (e) {
                console.error('Failed to get preferences', e);
            }
            fetchTrends('all', geo);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch when geo or category changes
    useEffect(() => {
        fetchTrends(category, geo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geo, category]);

    /* ─── Client-side filter + sort ─── */
    const displayedTrends = useMemo(() => {
        let filtered = [...allTrends];

        // Status filter
        if (trendStatus === 'hot') {
            filtered = filtered.filter(t => t.velocity === 'rising_fast' || t.velocity === 'breakout');
        } else if (trendStatus === 'rising') {
            filtered = filtered.filter(t => t.velocity === 'rising');
        }

        // Sort
        if (sortBy === 'volume_desc') {
            filtered.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        } else if (sortBy === 'volume_asc') {
            filtered.sort((a, b) => (a.volume || 0) - (b.volume || 0));
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => (a.keyword || '').localeCompare(b.keyword || ''));
        }
        // 'relevance' keeps original order

        return filtered;
    }, [allTrends, trendStatus, sortBy]);

    const currentLocation = LOCATIONS.find(l => l.code === geo)?.label || geo;

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

                    {/* ────── Google Trends-style Filter Bar ────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-8 flex flex-wrap gap-3 items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <FilterDropdown
                            icon={Globe}
                            value={geo}
                            options={LOCATIONS}
                            onChange={setGeo}
                        />

                        <FilterDropdown
                            icon={Clock}
                            value="24h"
                            options={[{ value: '24h', label: 'Past 24 hours' }]}
                            onChange={() => { }}
                        />

                        <FilterDropdown
                            icon={Filter}
                            value={category}
                            options={CATEGORIES}
                            onChange={setCategory}
                            accent
                        />

                        <FilterDropdown
                            icon={Zap}
                            value={trendStatus}
                            options={TREND_STATUS}
                            onChange={setTrendStatus}
                        />

                        <div className="flex-grow"></div>

                        <FilterDropdown
                            icon={BarChart3}
                            value={sortBy}
                            options={SORT_OPTIONS}
                            onChange={setSortBy}
                        />
                    </motion.div>

                    {/* Stats bar */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-bold text-gray-900 dark:text-white">{displayedTrends.length}</span> trends from <span className="font-bold text-gray-900 dark:text-white">{currentLocation}</span>
                        </p>
                        <button
                            onClick={() => fetchTrends(category, geo)}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                            🔄 Refresh
                        </button>
                    </div>

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
                    ) : displayedTrends.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                        >
                            <p className="text-2xl font-medium mb-2 text-gray-900 dark:text-gray-100">No trends found</p>
                            <p className="mb-6">Try selecting a different category or change the status filter.</p>
                            <button
                                onClick={() => fetchTrends(category, geo)}
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
                                    transition: { staggerChildren: 0.08 }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {displayedTrends.map((trend, index) => (
                                <TrendCard key={`${trend.keyword}-${index}`} trend={trend} />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ───────── TrendCard ───────── */
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
