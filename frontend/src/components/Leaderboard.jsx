import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { Trophy, Bookmark, Medal } from 'lucide-react';

export default function Leaderboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/trends/leaderboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data.leaderboard || []);
            } catch (e) {
                console.error("Failed to load leaderboard", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const podiumColors = [
        "from-yellow-400 to-amber-500 text-yellow-900",
        "from-gray-300 to-gray-400 text-gray-700",
        "from-orange-400 to-amber-600 text-orange-900",
    ];

    const formatVolume = (vol) => {
        if (!vol) return 'N/A';
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `${Math.floor(vol / 1000)}K`;
        return `${vol}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
                        <Trophy className="text-yellow-500 w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-500 via-orange-400 to-pink-500 bg-clip-text text-transparent leading-tight">Weekly Leaderboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">Top 10 trends bookmarked by the community in the past 7 days</p>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Bookmark className="text-gray-300 dark:text-gray-600 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No data yet</h3>
                        <p className="text-gray-500 text-center text-sm max-w-xs">Start bookmarking trends on the dashboard to see results here!</p>
                    </div>
                ) : (
                    <>
                        {/* Podium */}
                        {data.length >= 3 && (
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[data[1], data[0], data[2]].map((item, i) => {
                                    const trueRank = i === 1 ? 1 : i === 0 ? 2 : 3;
                                    return (
                                        <motion.div
                                            key={item.keyword}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`relative flex flex-col items-center p-4 rounded-2xl text-center bg-gradient-to-b ${podiumColors[trueRank - 1]} ${i === 1 ? 'shadow-xl scale-105' : 'shadow-md opacity-90'}`}
                                        >
                                            <Medal size={20} className="mb-2" />
                                            <span className="text-2xl font-black">#{trueRank}</span>
                                            <span className="text-sm font-bold mt-1 leading-tight capitalize">{item.keyword}</span>
                                            <span className="text-xs font-bold mt-2 opacity-70">{item.saves} saves</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Full list */}
                        <div className="bg-white dark:bg-gray-900/50 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                            {data.map((item, index) => (
                                <motion.div
                                    key={item.keyword}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <span className={`text-lg font-black w-8 text-center ${
                                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-gray-500'
                                    }`}>#{item.rank}</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white capitalize">{item.keyword}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. volume: {formatVolume(item.avg_volume)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full text-sm font-bold">
                                        <Bookmark size={12} />
                                        {item.saves}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
