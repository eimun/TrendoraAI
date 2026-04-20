import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { BarChart3, Bookmark, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const VELOCITY_LABELS = {
    rising_fast: '🔥 Rising Fast',
    breakout: '💥 Breakout',
    rising: '📈 Rising',
    normal: '➡️ Normal',
    stable: '🟡 Stable',
    unknown: '❓ Unknown',
};

const VELOCITY_COLORS = {
    rising_fast: '#ef4444',
    breakout: '#f97316',
    rising: '#10b981',
    normal: '#6366f1',
    stable: '#8b5cf6',
    unknown: '#9ca3af',
};

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/bookmarks/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (e) {
                console.error("Failed to load analytics", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-3 gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse" />)}
                    </div>
                    <div className="h-64 bg-white dark:bg-gray-800 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    const byVelocity = (data?.by_velocity || []).map(d => ({
        ...d,
        name: VELOCITY_LABELS[d.label] || d.label,
        color: VELOCITY_COLORS[d.label] || '#9ca3af',
    }));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                        <BarChart3 className="text-purple-500 w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent leading-tight">My Analytics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">Your personal Trendora activity and bookmarks breakdown</p>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Bookmarks', value: data?.total_saves ?? 0, icon: Bookmark, color: 'purple' },
                        { label: 'Top Velocity Type', value: VELOCITY_LABELS[data?.top_category] || data?.top_category || 'N/A', icon: Star, color: 'yellow' },
                        { label: 'Categories Tracked', value: data?.by_velocity?.length ?? 0, icon: TrendingUp, color: 'emerald' },
                    ].map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4"
                        >
                            <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20`}>
                                <card.icon size={22} className={`text-${card.color}-600 dark:text-${card.color}-400`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Velocity breakdown bar chart */}
                {byVelocity.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Bookmarks by Trend Velocity</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byVelocity} barSize={24}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={28} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '12px' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {byVelocity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Saves over time */}
                {data?.over_time?.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Weekly Saves (Last 6 Weeks)</h2>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={data.over_time} barSize={20}>
                                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={28} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '12px' }} />
                                <Bar dataKey="saves" radius={[6, 6, 0, 0]} fill="#a855f7" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
