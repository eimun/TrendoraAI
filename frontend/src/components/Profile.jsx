import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Settings, Save, CheckCircle2, Calendar, Bookmark, Mail, Shield, Sparkles } from 'lucide-react';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const NICHES = [
    { value: 'tech', label: 'Tech & AI', emoji: '💻' },
    { value: 'finance', label: 'Finance & Crypto', emoji: '📈' },
    { value: 'health', label: 'Health & Wellness', emoji: '🧘' },
    { value: 'gaming', label: 'Gaming', emoji: '🎮' },
    { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { value: 'fashion', label: 'Fashion & Lifestyle', emoji: '✨' },
];

function Profile() {
    const [profile, setProfile] = useState({ email: '', default_niche: 'tech', created_at: null, saved_count: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile({
                email: res.data.email,
                default_niche: res.data.default_niche,
                created_at: res.data.created_at,
                saved_count: res.data.saved_count
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/auth/preferences`, {
                default_niche: profile.default_niche
            }, { headers: { Authorization: `Bearer ${token}` } });
            setMessage('Preferences updated!');
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage('Failed to update preferences.');
        } finally {
            setSaving(false);
        }
    };

    const initials = profile.email ? profile.email.slice(0, 2).toUpperCase() : '??';
    const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
    const selectedNiche = NICHES.find(n => n.value === profile.default_niche);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
                <div className="max-w-2xl mx-auto space-y-5">
                    <div className="h-52 bg-white dark:bg-gray-800 rounded-3xl animate-pulse" />
                    <div className="h-40 bg-white dark:bg-gray-800 rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-8">
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800"
                >
                    {/* Banner */}
                    <div className="h-28 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 relative">
                        <div className="absolute inset-0 opacity-20 overflow-hidden">
                            <Sparkles size={80} className="absolute -top-4 -right-4 rotate-12 text-white" />
                            <Sparkles size={40} className="absolute top-4 left-16" />
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="px-6 pb-6">
                        <div className="flex items-end justify-between -mt-12 mb-4">
                            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 ring-4 ring-white dark:ring-gray-900 flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-black bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                    {initials}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800/40">
                                <Shield size={12} /> Verified Member
                            </div>
                        </div>

                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{profile.email}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar size={14} /> Joined {joinDate}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                <Bookmark size={14} /> {profile.saved_count || 0} bookmarks
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                <Mail size={14} /> {profile.email}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Saved Trends</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">{profile.saved_count || 0}</p>
                        <p className="text-xs text-purple-500 font-bold mt-1">Total bookmarks</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fav Niche</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">{selectedNiche?.emoji || '✨'}</p>
                        <p className="text-xs text-pink-500 font-bold mt-1">{selectedNiche?.label || 'Tech & AI'}</p>
                    </motion.div>
                </div>

                {/* Preferences Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <Settings size={18} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Preferences</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Customize your dashboard experience</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                Default Dashboard Niche
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {NICHES.map(niche => (
                                    <button
                                        type="button"
                                        key={niche.value}
                                        onClick={() => setProfile({ ...profile, default_niche: niche.value })}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all text-left ${
                                            profile.default_niche === niche.value
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400 dark:border-purple-500 text-purple-700 dark:text-purple-400 shadow-sm'
                                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                                        }`}
                                    >
                                        <span className="text-base">{niche.emoji}</span>
                                        <span className="text-xs leading-tight">{niche.label}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">This niche auto-loads when you open the dashboard.</p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>

                            <AnimatePresence>
                                {message && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-emerald-500 text-sm font-bold flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 size={16} /> {message}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default Profile;
