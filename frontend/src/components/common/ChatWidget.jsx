import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, MinusSquare, Maximize2 } from 'lucide-react';
import {
    useGetChatSessionsQuery,
    useCreateChatSessionMutation,
    useSendChatMessageMutation
} from '../../store/api';
import toast from 'react-hot-toast';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    const { data: sessions, isLoading: sessionsLoading } = useGetChatSessionsQuery();
    const [createSession] = useCreateChatSessionMutation();
    const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();

    const sessionsArray = Array.isArray(sessions) ? sessions : (sessions?.results || []);
    const currentSession = sessionsArray.find(s => s.id === currentSessionId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentSession?.messages, isOpen, isMinimized]);

    const handleOpen = async () => {
        setIsOpen(true);
        setIsMinimized(false);
        if (!currentSessionId) {
            // Check if there's an existing session to resume
            if (sessionsArray.length > 0) {
                setCurrentSessionId(sessionsArray[0].id);
            } else {
                try {
                    const newSession = await createSession({ title: 'New Chat' }).unwrap();
                    setCurrentSessionId(newSession.id);
                } catch (err) {
                    toast.error('Failed to start chat session');
                }
            }
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const content = input;
        setInput('');

        try {
            await sendMessage({ id: currentSessionId, content }).unwrap();
        } catch (err) {
            toast.error('Failed to send message');
            setInput(content); // Restore input on failure
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary-600 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    return (
        <div className={`fixed right-6 bottom-6 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all z-50 flex flex-col overflow-hidden ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Lifeline Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-slate-400 font-medium">Assistant Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <MinusSquare className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {currentSession?.messages?.length === 0 && (
                            <div className="text-center py-10 px-6">
                                <MessageSquare className="h-12 w-12 text-primary-500 mx-auto mb-4 opacity-50" />
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Hello! I'm your Lifeline Assistant</h4>
                                <p className="text-xs text-slate-500">Ask me anything about your leave, payslips, or company policies.</p>
                            </div>
                        )}
                        {currentSession?.messages?.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isSending}
                            className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatWidget;
