import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, Bookmark, CheckCircle2, ChevronDown, Globe, Clock, Filter, BarChart3, Zap, Search } from 'lucide-react';
import TrendModal from './TrendModal';
import AIChatBot from './AIChatBot';

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

const TIMEFRAMES = [
    { value: 'now 1-d', label: 'Past 24 hours' },
    { value: 'now 7-d', label: 'Past 7 days' },
    { value: 'today 1-m', label: 'Past 30 days' },
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
    const [savedKeywords, setSavedKeywords] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrend, setSelectedTrend] = useState(null);
    const [trendsCache, setTrendsCache] = useState({});
    const [timeframe, setTimeframe] = useState('now 1-d');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchTrends = async (niche, geoCode, tf = timeframe) => {
        const cacheKey = `${niche}-${geoCode}-${tf}`;
        
        if (trendsCache[cacheKey]) {
            setAllTrends(trendsCache[cacheKey]);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/trends/fetch`,
                { niche, geo: geoCode, timeframe: tf },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllTrends(response.data.trends);
            setTrendsCache(prev => ({ ...prev, [cacheKey]: response.data.trends }));
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch trends');
        }
        setLoading(false);
    };

    // Force refresh button bypasses cache
    const handleRefresh = () => {
        setTrendsCache(prev => ({ ...prev, [`${category}-${geo}-${timeframe}`]: null }));
        fetchTrends(category, geo, timeframe);
    };

    // On mount: load saved bookmarks + check user preference
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');

            // Pre-load saved keywords so bookmark icons show correct state
            try {
                const savedRes = await axios.get(`${API_URL}/api/bookmarks/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const keywords = new Set(
                    (savedRes.data.trends || []).map(t => t.keyword.toLowerCase())
                );
                setSavedKeywords(keywords);
            } catch (e) {
                console.error('Failed to load saved keywords', e);
            }

            try {
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

    // Re-fetch when geo, category, or timeframe changes
    useEffect(() => {
        fetchTrends(category, geo, timeframe);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geo, category, timeframe]);

    /* ─── Client-side filter + sort ─── */
    const displayedTrends = useMemo(() => {
        let filtered = [...allTrends];

        // Search query filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => (t.keyword || '').toLowerCase().includes(query));
        }

        // Status filter
        if (trendStatus === 'hot') {
            filtered = filtered.filter(t => t.velocity === 'rising_fast' || t.velocity === 'breakout');
        } else if (trendStatus === 'rising') {
            filtered = filtered.filter(t => t.velocity === 'rising');
        }

        // Sort
        if (sortBy === 'relevance') {
            filtered.sort((a, b) => (b.virality_score || 0) - (a.virality_score || 0) || (b.volume || 0) - (a.volume || 0));
        } else if (sortBy === 'volume_desc') {
            filtered.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        } else if (sortBy === 'volume_asc') {
            filtered.sort((a, b) => (a.volume || 0) - (b.volume || 0));
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => (a.keyword || '').localeCompare(b.keyword || ''));
        }

        return filtered;
    }, [allTrends, trendStatus, sortBy, searchQuery]);

    const currentLocation = LOCATIONS.find(l => l.code === geo)?.label || geo;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end gap-3 mb-8 justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                                <TrendingUp className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent leading-tight">Trending Topics</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">Real-time internet trend intelligence</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-300">Live scanning</span>
                            <span className="text-purple-600 dark:text-purple-400 ml-1">{allTrends.length} trends</span>
                        </div>
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
                            value={timeframe}
                            options={TIMEFRAMES}
                            onChange={setTimeframe}
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

                        {/* Search Bar */}
                        <div className="relative flex-grow max-w-xs ml-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search trends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                            />
                        </div>

                        <div className="flex-grow"></div>

                        <FilterDropdown
                            icon={BarChart3}
                            value={sortBy}
                            options={SORT_OPTIONS}
                            onChange={setSortBy}
                        />
                    </motion.div>

                    <div className="mb-6 flex items-center justify-between bg-white dark:bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{displayedTrends.length}</span> trends from <span className="font-bold text-gray-900 dark:text-white">{currentLocation}</span>
                            </p>
                            {lastUpdated && (
                                <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                                    <Clock size={10} /> Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold transition-colors flex items-center gap-1"
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    {/* Trends Grid */}
                    {loading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-900/40 rounded-3xl shadow-xl shadow-purple-500/5 border border-white/20 dark:border-gray-800/50 overflow-hidden backdrop-blur-xl mb-[600px]">
                            {/* Table Header skeleton style */}
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded col-span-1 shadow-inner opacity-50"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded col-span-3 opacity-50"></div>
                                <div className="col-span-8"></div>
                            </div>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 dark:border-gray-700/60 animate-pulse">
                                    <div className="col-span-1 flex justify-center"><div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div></div>
                                    <div className="col-span-4 lg:col-span-3 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
                                    </div>
                                    <div className="col-span-2 flex flex-col items-end space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="col-span-2 hidden md:block px-4">
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
                                    </div>
                                    <div className="col-span-3 hidden lg:block px-2">
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded-lg w-full"></div>
                                    </div>
                                    <div className="col-span-2 lg:col-span-1 flex justify-end">
                                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : displayedTrends.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-gray-900/40 rounded-3xl shadow-xl shadow-purple-500/5 border border-white/20 dark:border-gray-800/50 overflow-hidden backdrop-blur-xl"
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
                                    <TrendRow
                                        key={trend.keyword}
                                        trend={trend}
                                        index={index + 1}
                                        initialBookmarked={savedKeywords.has((trend.keyword || '').toLowerCase())}
                                        onBookmarkChange={(keyword) => setSavedKeywords(prev => new Set([...prev, keyword.toLowerCase()]))}
                                        onClick={() => setSelectedTrend(trend)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
                        >
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-gray-400" size={30} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No trends found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                                We couldn't find any trends matching your current filters or search query.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Slide-in Detail Modal */}
            <AnimatePresence>
                {selectedTrend && (
                    <TrendModal
                        trend={selectedTrend}
                        isBookmarked={savedKeywords.has((selectedTrend.keyword || '').toLowerCase())}
                        onClose={() => setSelectedTrend(null)}
                        onBookmarkChange={(keyword) => setSavedKeywords(prev => new Set([...prev, keyword.toLowerCase()]))}
                    />
                )}
            </AnimatePresence>
            
            <AIChatBot allTrends={displayedTrends} />
        </div>
    );
}

/* ───────── TrendRow (List View) ───────── */
function TrendRow({ trend, index, initialBookmarked = false, onBookmarkChange, onClick }) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const [toastMsg, setToastMsg] = useState('');


    const handleBookmark = async (e) => {
        e.stopPropagation();
        if (isBookmarked) return; // Already saved, do nothing

        // Optimistic update — mark as saved instantly for snappy UX
        setIsBookmarked(true);
        setToastMsg('Saving...');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/bookmarks/`, {
                keyword: trend.keyword,
                volume: trend.volume || 1000,
                velocity: trend.velocity || 'normal'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onBookmarkChange) onBookmarkChange(trend.keyword);
            setToastMsg('Saved!');
            setTimeout(() => setToastMsg(''), 2000);
        } catch (error) {
            if (error.response?.status === 400) {
                // Already saved in DB — keep it marked as saved
                setToastMsg('Already saved!');
            } else {
                // Real error — revert the optimistic update
                setIsBookmarked(false);
                setToastMsg('Failed to save');
            }
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
            onClick={onClick}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800/80 transition-all duration-300 last:border-0 cursor-pointer hover:shadow-lg hover:shadow-purple-500/5 sm:hover:scale-[1.01] hover:z-10 relative bg-transparent"
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
                <div className="flex items-center gap-2 mt-1">
                    {trend.niche && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize border border-gray-200 dark:border-gray-700 shadow-sm">
                            {trend.niche}
                        </span>
                    )}
                    {isHot && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                            <TrendingUp size={10} /> Hot
                        </span>
                    )}
                </div>
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
                <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black ${
                        (trend.virality_score || 0) >= 80 ? 'text-red-500' :
                        (trend.virality_score || 0) >= 50 ? 'text-orange-500' :
                        'text-emerald-500'
                    }`}>
                        {trend.virality_score || 0}
                    </span>
                    <span className="text-xs font-bold text-gray-400">/ 100</span>
                </div>
                {trend.virality_score > 0 && (
                    <div className="w-20 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                                trend.virality_score >= 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                trend.virality_score >= 50 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                                'bg-gradient-to-r from-emerald-400 to-teal-400'
                            }`}
                            style={{ width: `${trend.virality_score}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Mini Sparkline Chart */}
            <div className="col-span-3 hidden lg:block h-12 w-full px-2 group-hover:scale-105 transition-transform duration-300">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`colorVolRow-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isHot ? "#ef4444" : "#10b981"} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={isHot ? "#ef4444" : "#10b981"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke={isHot ? "#ef4444" : "#10b981"}
                            strokeWidth={2}
                            fill={`url(#colorVolRow-${index})`}
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
