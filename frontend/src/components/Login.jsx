import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

        try {
            const response = await axios.post(`${API_URL}${endpoint}`, {
                email,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user_id);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 dark:border-gray-700 backdrop-blur-sm"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                        Trendora
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        {isRegister ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all outline-none"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all"
                    >
                        {isRegister ? 'Sign Up' : 'Login'}
                    </button>
                </form>

                <p className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                    >
                        {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}

export default Login;
