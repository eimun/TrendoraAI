import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export default function AIChatBot({ allTrends }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Trendora AI. Ask me anything about the trends currently on your dashboard!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/chat/message`, {
                messages: newMessages,
                trend_context: allTrends
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'assistant', content: "Sorry, I ran into an error pulling that data down." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-900 w-80 sm:w-[400px] h-[550px] mb-4 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="bg-purple-600 dark:bg-purple-700 p-4 shrink-0 flex items-center justify-between text-white shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                                <Bot size={100} />
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-wide">Trendora AI Assistant</h3>
                                    <p className="text-[10px] text-purple-200 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online (Llama 3)</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-purple-200 hover:text-white transition-colors relative z-10 p-2 hover:bg-white/10 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-500/20' 
                                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                                    }`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-purple-600" />
                                        <span className="text-xs text-gray-500 font-bold">Llama 3 is analyzing trends...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Need video ideas for these trends?"
                                    className="w-full bg-gray-100/80 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full pl-4 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border border-transparent dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-1.5 p-2 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-md shadow-purple-500/20 disabled:opacity-0 disabled:scale-75 transition-all duration-200"
                                >
                                    <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(147,51,234,0.4)] transition-colors relative border-2 border-purple-400/30"
            >
                {isOpen ? <X size={28} /> : (
                    <>
                        <MessageCircle size={28} />
                        <Sparkles size={14} className="absolute top-2.5 right-2.5 text-yellow-300 animate-pulse" />
                    </>
                )}
            </motion.button>
        </div>
    );
}
