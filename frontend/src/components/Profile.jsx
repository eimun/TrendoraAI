import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Settings, Save, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

function Profile() {
    const [profile, setProfile] = useState({ email: '', default_niche: 'tech' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile({ email: res.data.email, default_niche: res.data.default_niche });
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
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Preferences updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setMessage('Failed to update preferences.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pt-20">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Settings className="text-purple-500" /> Account Settings
            </h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden"
            >
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile.email}</h2>
                            <p className="text-gray-500 dark:text-gray-400">Manage your personalized dashboard experience</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            Default Dashboard Niche
                        </label>
                        <select
                            value={profile.default_niche}
                            onChange={(e) => setProfile({ ...profile, default_niche: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                        >
                            <option value="tech">Tech & AI</option>
                            <option value="finance">Finance & Crypto</option>
                            <option value="health">Health & Wellness</option>
                            <option value="gaming">Gaming</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="fashion">Fashion & Lifestyle</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            This category will load automatically when you visit your dashboard.
                        </p>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save Preferences</>}
                        </button>

                        {message && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-emerald-500 text-sm font-semibold flex items-center gap-1"
                            >
                                <CheckCircle2 size={16} /> {message}
                            </motion.span>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default Profile;
