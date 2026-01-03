import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, Clock, CalendarDays, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FocusMode = () => {
    const { user, setUser } = useAuth();
    const { isDark } = useTheme();
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [currentTrack, setCurrentTrack] = useState(null);

    // Initialize from localStorage on mount
    useEffect(() => {
        const checkPersistence = () => {
            const savedIsActive = localStorage.getItem('focus_isActive') === 'true';
            const savedTarget = localStorage.getItem('focus_targetTime');
            const savedTimeLeft = localStorage.getItem('focus_timeLeft');
            const savedStartTime = localStorage.getItem('focus_startTime');

            if (savedIsActive && savedTarget && savedStartTime) {
                const now = Date.now();
                const target = parseInt(savedTarget);
                const start = parseInt(savedStartTime);
                const remaining = Math.ceil((target - now) / 1000);

                if (remaining > 0) {
                    setTimeLeft(remaining);
                    setElapsedTime(Math.floor((now - start) / 1000));
                    setIsActive(true);
                } else {
                    // Timer finished while away
                    setIsActive(false);
                    setTimeLeft(0);
                    setElapsedTime(Math.floor((target - start) / 1000)); // Cap elapsed at total duration
                    handleSessionComplete(); // This might trigger twice if logic isn't careful, but handleSessionComplete clears state usually
                }
            } else if (savedTimeLeft) {
                // Was paused with saved time
                setTimeLeft(parseInt(savedTimeLeft));
            }
        };

        checkPersistence();
    }, []);

    const generateEmptyData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            data.push({
                name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                minutes: 0
            });
        }
        return data;
    };

    const [stats, setStats] = useState({
        chartData: generateEmptyData(),
        totalSessions: 0,
        totalSeconds: 0
    });
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/focus/stats');
            setStats(prev => ({
                ...res.data,
                chartData: res.data.chartData && res.data.chartData.length > 0 ? res.data.chartData : prev.chartData
            }));
        } catch (err) {
            console.error('Error fetching focus stats:', err);
        }
    };

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                // Sync with wall clock for accuracy and persistence
                const target = parseInt(localStorage.getItem('focus_targetTime') || '0');
                const start = parseInt(localStorage.getItem('focus_startTime') || '0');

                if (target && start) {
                    const now = Date.now();
                    const remaining = Math.ceil((target - now) / 1000);

                    if (remaining <= 0) {
                        setTimeLeft(0);
                        setElapsedTime(Math.floor((target - start) / 1000));
                        setIsActive(false);
                        handleSessionComplete();
                        clearInterval(interval);
                    } else {
                        setTimeLeft(remaining);
                        setElapsedTime(Math.floor((now - start) / 1000));
                    }
                } else {
                    // Fallback to simpler decrement if storage missing (shouldn't happen)
                    setTimeLeft(prev => prev - 1);
                    setElapsedTime(prev => prev + 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleSessionComplete = async () => {
        // Clear persistence
        localStorage.removeItem('focus_isActive');
        localStorage.removeItem('focus_targetTime');
        localStorage.removeItem('focus_startTime');
        localStorage.removeItem('focus_timeLeft');

        await saveSession(25 * 60, 'complete');
        setTimeLeft(25 * 60);
        setElapsedTime(0);
    };

    const handleStop = async () => {
        setIsActive(false);

        // Clear persistence
        localStorage.removeItem('focus_isActive');
        localStorage.removeItem('focus_targetTime');
        localStorage.removeItem('focus_startTime');
        localStorage.removeItem('focus_timeLeft');

        if (elapsedTime > 0) {
            await saveSession(elapsedTime, 'reset');
        }
        setTimeLeft(25 * 60);
        setElapsedTime(0);
    };

    const saveSession = async (seconds, action = 'complete') => {
        try {
            const res = await api.post('/focus', { durationSeconds: seconds, action });

            if (user && setUser) {
                setUser({ ...user, points: res.data.totalPoints });
            }
            fetchStats();
        } catch (err) {
            console.error('Error saving focus session:', err);
        }
    };

    const toggleTimer = async () => {
        if (isActive) {
            // Pausing
            setIsActive(false);

            // Update persistence for paused state
            localStorage.setItem('focus_isActive', 'false');
            localStorage.setItem('focus_timeLeft', timeLeft.toString());
            localStorage.removeItem('focus_targetTime');
            localStorage.removeItem('focus_startTime');

            if (elapsedTime > 0) {
                await saveSession(elapsedTime, 'pause');
                setElapsedTime(0);
            }
        } else {
            // Starting / Resuming
            const now = Date.now();
            const target = now + (timeLeft * 1000);

            localStorage.setItem('focus_isActive', 'true');
            localStorage.setItem('focus_targetTime', target.toString());
            // We recount "elapsed" from 0 for this segment if resuming from pause, 
            // OR we track session start. 
            // Current saveSession('pause') logic implies we save small chunks. 
            // So for a new segment, start time is NOW.
            localStorage.setItem('focus_startTime', now.toString());

            setIsActive(true);
        }
    };

    // Format total time as Xh Xm Xs
    const formatTotalTime = (totalSecs) => {
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return { hours, mins, secs };
    };



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResetHistory = async () => {
        if (!window.confirm('Are you sure you want to delete ALL focus history? This cannot be undone.')) return;
        try {
            await api.delete('/focus/all');
            setStats({
                chartData: generateEmptyData(),
                totalSessions: 0,
                totalSeconds: 0
            });
            // Update local user state if available to reflect changes immediately
            if (user && setUser) {
                setUser(prev => ({ ...prev, focusSeconds: 0, focusMinutes: 0 }));
            }
            toast.success('Focus history deleted');
        } catch (err) {
            console.error('Error deleting history:', err);
            toast.error('Failed to delete history');
        }
    };

    const audioRef = React.useRef(null);

    const tracks = [
        { id: 1, name: 'Rain Sounds', type: 'Nature', url: 'https://cdn.pixabay.com/download/audio/2022/07/04/audio_13b6329432.mp3?filename=rain-and-thunder-115340.mp3' }, // Rain & Thunder
        { id: 2, name: 'Forest Ambience', type: 'Nature', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_663eb07d22.mp3?filename=forest-birds-ambience-121049.mp3' }, // Forest Birds
        { id: 3, name: 'Lo-Fi Beats', type: 'Music', url: 'https://stream.zeno.fm/0r0xa854rp8uv' }, // Lofi Hiphop Radio
        { id: 4, name: 'White Noise', type: 'Focus', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_a46b6e4926.mp3?filename=soft-rain-ambient-111154.mp3' }, // Soft Rain/White Noise
    ];

    useEffect(() => {
        if (currentTrack) {
            const track = tracks.find(t => t.id === currentTrack);
            if (track && audioRef.current) {
                audioRef.current.src = track.url;
                audioRef.current.volume = 0.5; // Set default volume to 50%
                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error("Audio playback failed:", err);
                        toast.error(`Failed to play ${track.name}. Stream might be offline.`);
                        setCurrentTrack(null); // Reset UI
                    });
                }
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [currentTrack]);


    return (
        <div className="w-full h-full max-w-6xl mx-auto text-center pb-32">
            <header className="mb-12">
                <h2 className={`text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Focus</h2>
                <p className="text-gray-400 text-lg">Deep work session.</p>
            </header>

            {/* Timer Circle */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-16 flex items-center justify-center">
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-8 border-white/5"></div>

                {/* Animated Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                    <circle
                        cx="160"
                        cy="160"
                        r="156"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="980"
                        strokeDashoffset={980 - (980 * (timeLeft / (25 * 60)))}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#bf5af2" /> {/* Purple */}
                            <stop offset="100%" stopColor="#ff375f" /> {/* Pink */}
                        </linearGradient>
                    </defs>
                </svg>

                <div className={`text-6xl md:text-8xl font-thin tracking-tighter font-mono z-10 selection:bg-transparent ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full animate-pulse pointer-events-none"></div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-8 mb-16">
                <button
                    onClick={toggleTimer}
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 border border-transparent"
                    style={{
                        backgroundColor: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff'
                    }}
                >
                    {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                </button>
                <button
                    onClick={handleStop}
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 backdrop-blur-md border"
                    style={{
                        backgroundColor: isDark ? '#27272a' : '#f3f4f6', // zinc-800 / gray-100
                        borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                        color: isDark ? '#ffffff' : '#000000'
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-md"
                        style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
                    />
                </button>
            </div>

            <div className="flex flex-col gap-8 text-left">
                {/* Analytics Section */}
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-3xl border overflow-hidden relative group ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'}`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3 text-purple-500">
                                        <Clock size={24} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Total Focus Time</span>
                                    </div>
                                    <button
                                        onClick={handleResetHistory}
                                        className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition-all"
                                        title="Delete All History"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatTotalTime(stats.totalSeconds || 0).hours}<span className="text-xl text-gray-500 ml-1">h</span>{' '}
                                    {formatTotalTime(stats.totalSeconds || 0).mins}<span className="text-xl text-gray-500 ml-1">m</span>{' '}
                                    {formatTotalTime(stats.totalSeconds || 0).secs}<span className="text-xl text-gray-500 ml-1">s</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`p-6 rounded-3xl border overflow-hidden relative group ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'}`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2 text-blue-500">
                                    <CalendarDays size={24} />
                                    <span className="font-bold text-sm uppercase tracking-wider">Total Sessions</span>
                                </div>
                                <div className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats.totalSessions || 0}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Chart */}
                    <div className={`p-5 md:p-8 rounded-3xl border ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'}`}>
                        <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-zinc-400' : 'text-gray-700'}`}>Daily Focus Activity</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart
                                    data={stats.chartData && stats.chartData.length > 0 ? stats.chartData : generateEmptyData()}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="focusChartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isDark ? '#a1a1aa' : '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                        interval={0} // Force all ticks to show if possible
                                    />
                                    <YAxis
                                        hide={true}
                                        domain={[0, (dataMax) => (dataMax === 0 ? 60 : dataMax * 1.2)]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#18181b' : '#fff',
                                            borderRadius: '12px',
                                            border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        itemStyle={{ color: isDark ? '#fff' : '#000' }}
                                        formatter={(value) => [`${value} mins`, 'Focus Time']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="minutes"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#focusChartGradient)"
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Audio Player (Moved to bottom, full width) */}
                <div className={`p-5 md:p-8 rounded-3xl border ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'}`}>
                    <div className="flex items-center gap-3 mb-6 text-gray-400">
                        <Volume2 size={20} />
                        <span className="font-bold uppercase text-xs tracking-widest">Soundscapes</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tracks.map((track) => (
                            <button
                                key={track.id}
                                onClick={() => setCurrentTrack(track.id === currentTrack ? null : track.id)}
                                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left group ${currentTrack === track.id
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : isDark ? 'bg-transparent border-zinc-800 hover:bg-zinc-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentTrack === track.id ? 'bg-purple-500 text-white' : isDark ? 'bg-zinc-800 text-gray-400 group-hover:text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-900'
                                    }`}>
                                    <Music size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className={`font-bold text-sm truncate ${currentTrack === track.id ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-zinc-400' : 'text-gray-600')}`}>
                                        {track.name}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">{track.type}</div>
                                </div>
                                {currentTrack === track.id && (
                                    <div className="ml-auto">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <audio ref={audioRef} loop className="hidden" />
        </div>
    );
};

export default FocusMode;
