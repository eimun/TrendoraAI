import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
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

/* ───────── Dropdown Component (Custom UI) ───────── */
function FilterDropdown({ icon: Icon, value, options, onChange, accent }) {
    const [isOpen, setIsOpen] = useState(false);

    // Check click outside
    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const activeOption = options.find(o => (o.value || o.code) === value) || options[0];

    return (
        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                    cursor-pointer transition-all duration-200
                    ${accent
                        ? 'bg-purple-600 text-white shadow-purple-500/20 shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
            >
                <Icon size={15} className={accent ? 'text-purple-200' : 'text-gray-400 dark:text-gray-400'} />
                <span>{activeOption?.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${accent ? 'text-purple-200' : 'text-gray-400 dark:text-gray-400'}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden"
                    >
                        {options.map((opt) => {
                            const val = opt.value || opt.code;
                            const isSelected = val === value;
                            return (
                                <div
                                    key={val}
                                    onClick={() => {
                                        onChange(val);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors
                                        ${isSelected
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <CheckCircle2 size={14} className="text-purple-600 dark:text-purple-400" />}
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
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
                                    transition: { staggerChildren: 0.05 }
                                }
                            }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-4 lg:col-span-3">Trends</div>
                                <div className="col-span-2 text-right">Search Volume</div>
                                <div className="col-span-2 text-center hidden md:block">Score</div>
                                <div className="col-span-3 text-center hidden lg:block">Trend Breakdown</div>
                                <div className="col-span-1 text-right"></div>
                            </div>

                            {/* Table List */}
                            <div className="flex flex-col">
                                {displayedTrends.map((trend, index) => (
                                    <TrendRow key={`${trend.keyword}-${index}`} trend={trend} index={index + 1} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ───────── TrendRow (List View) ───────── */
function TrendRow({ trend, index }) {
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
            setToastMsg('Saved!');
            setTimeout(() => setToastMsg(''), 2000);
        } catch (error) {
            console.error('Failed to bookmark trend:', error);
            setToastMsg('Already saved!');
            setTimeout(() => setToastMsg(''), 2000);
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

    const isHot = trend.velocity === 'rising_fast' || trend.velocity === 'breakout';

    // Formatting volume e.g. 50000 -> 50K+
    const formatVolume = (vol) => {
        if (!vol) return 'N/A';
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}m+`;
        if (vol >= 1000) return `${Math.floor(vol / 1000)}k+`;
        return `${vol}+`;
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 }
            }}
            className="group grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors last:border-0"
        >
            {/* Rank / Index */}
            <div className="col-span-1 text-center font-semibold text-gray-400 dark:text-gray-500">
                {index}
            </div>

            {/* Keyword & Status Component */}
            <div className="col-span-4 lg:col-span-3 pr-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-1 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {trend.keyword}
                </h3>
                {isHot && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
                        <TrendingUp size={12} /> Active
                    </span>
                )}
            </div>

            {/* Search Volume */}
            <div className="col-span-2 text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVolume(trend.volume)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                    ↑ {isHot ? '1,000%' : '100%'}
                </div>
            </div>

            {/* Virality Score */}
            <div className="col-span-2 hidden md:flex flex-col items-center justify-center">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {trend.virality_score || 0} / 100
                </div>
                {trend.virality_score > 0 && (
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1.5 overflow-hidden">
                        <div
                            className={`h-full ${isHot ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${trend.virality_score}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Mini Sparkline Chart */}
            <div className="col-span-3 hidden lg:block h-12 w-full px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke={isHot ? "#ef4444" : "#10b981"}
                            strokeWidth={2}
                            fill="transparent"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Action Buttons */}
            <div className="col-span-2 lg:col-span-1 flex justify-end items-center relative">
                <button
                    onClick={handleBookmark}
                    disabled={isBookmarked}
                    className={`p-2 rounded-full transition-all ${isBookmarked
                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-not-allowed'
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                        }`}
                    title={isBookmarked ? "Saved" : "Bookmark"}
                >
                    {isBookmarked ? <CheckCircle2 size={20} /> : <Bookmark size={20} />}
                </button>

                <AnimatePresence>
                    {toastMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-12 bottom-0 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded shadow-lg text-xs font-bold whitespace-nowrap z-10"
                        >
                            {toastMsg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default Dashboard;
