import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Check, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const HabitCard = ({ habit, isDark, onToggle, onDelete, completed, streak }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const completedDatesSet = new Set(habit.completedDates.map(d => new Date(d).toISOString().split('T')[0]));

    // Calendar Navigation
    const nextMonth = () => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() + 1);
        setViewDate(d);
    };

    const prevMonth = () => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() - 1);
        setViewDate(d);
    };

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

    const handleDateClick = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        // Toggle specific date
        onToggle(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            layout
            className={`p-6 rounded-3xl border relative group transition-all ${completed
                ? (isDark ? 'bg-zinc-900/50 border-green-500/30' : 'bg-green-50 border-green-200')
                : (isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-lg')
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${streak > 0
                    ? 'bg-orange-500/10 text-orange-500'
                    : (isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-500')
                    }`}>
                    🔥 {streak} Day Streak
                </span>
                <button
                    onClick={onDelete}
                    className={`p-2 rounded-full transition-colors ${isDark ? 'text-zinc-500 hover:bg-zinc-800 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                        }`}
                    title="Delete Habit"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} ${completed ? 'line-through opacity-50' : ''}`}>
                {habit.title}
            </h3>

            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`text-sm flex items-center gap-1 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Calendar size={14} className="inline mr-1" />
                    History
                    {showCalendar ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                    onClick={() => onToggle()} // Default to today
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${completed
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                        : (isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-black')
                        }`}
                >
                    <Check size={24} />
                </button>
            </div>

            <AnimatePresence>
                {showCalendar && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-zinc-800"
                    >
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-4 px-1">
                            <button onClick={prevMonth} className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                                <ChevronLeft size={16} />
                            </button>
                            <span className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-gray-700'}`}>
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className={`text-[10px] text-center font-bold mb-1 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{d}</div>
                            ))}

                            {/* Empty slots for start of month */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const currentDateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
                                const isDone = completedDatesSet.has(currentDateStr);
                                const istoday = currentDateStr === new Date().toISOString().split('T')[0];

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`
                                            h-7 w-full rounded-md flex items-center justify-center text-xs font-medium transition-all
                                            ${isDone
                                                ? 'bg-green-500 text-white shadow-sm'
                                                : (istoday
                                                    ? (isDark ? 'bg-zinc-700 text-white ring-1 ring-white/50' : 'bg-gray-800 text-white')
                                                    : (isDark ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900')
                                                )
                                            }
                                        `}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const HabitTracker = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHabit, setNewHabit] = useState({ title: '', description: '' });

    useEffect(() => {
        fetchHabits();
        fetchStats();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits');
            setHabits(res.data);
        } catch (err) {
            console.error('Error fetching habits:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/habits/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching habit stats:', err);
        }
    };

    const handleCreateHabit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/habits', { ...newHabit, userId: user.id });
            setHabits([res.data, ...habits]);
            setNewHabit({ title: '', description: '' });
            setShowAddForm(false);
            toast.success('Habit created');
        } catch (err) {
            console.error('Error creating habit:', err);
            toast.error('Failed to create habit');
        }
    };

    const handleDeleteHabit = async (id) => {
        if (!window.confirm('Delete this habit?')) return;
        try {
            await api.delete(`/habits/${id}`);
            setHabits(habits.filter(h => h._id !== id));
            toast.success('Habit deleted');
            fetchStats();
        } catch (err) {
            console.error('Error deleting habit:', err);
            toast.error('Failed to delete habit');
        }
    };

    const toggleHabit = async (id, date = null) => {
        try {
            // Optimistic update
            const updatedHabits = habits.map(h => {
                if (h._id === id) {
                    const targetDate = date ? new Date(date) : new Date();
                    targetDate.setHours(0, 0, 0, 0);
                    // Use simple ISO date string for comparison to avoid timezone issues
                    // This assumes local time is what we care about
                    // A safer way is using the same getDateString logic or just string comparison
                    // Let's rely on the date object being consistent
                    const targetDateStr = targetDate.toISOString().split('T')[0];

                    const isCompleted = h.completedDates.some(d => new Date(d).toISOString().split('T')[0] === targetDateStr);
                    let newDates = [...h.completedDates];
                    if (isCompleted) {
                        newDates = newDates.filter(d => new Date(d).toISOString().split('T')[0] !== targetDateStr);
                    } else {
                        newDates.push(targetDate.toISOString());
                    }
                    return { ...h, completedDates: newDates };
                }
                return h;
            });
            setHabits(updatedHabits);

            await api.put(`/habits/${id}/toggle`, { date });
            fetchStats(); // Update chart
        } catch (err) {
            console.error('Error toggling habit:', err);
            fetchHabits(); // Revert
        }
    };

    const isCompletedToday = (habit) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return habit.completedDates.some(d => new Date(d).getTime() === today.getTime());
    };

    const getStreak = (habit) => {
        // Simple streak calculation
        let streak = 0;
        const sortedDates = [...habit.completedDates].sort((a, b) => new Date(b) - new Date(a));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentCheck = new Date(today);

        // Check if completed today, if so start streak from today, else check yesterday
        const completedToday = isCompletedToday(habit);
        if (!completedToday) {
            currentCheck.setDate(currentCheck.getDate() - 1);
        }

        for (const date of sortedDates) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            if (d.getTime() === currentCheck.getTime()) {
                streak++;
                currentCheck.setDate(currentCheck.getDate() - 1);
            }
        }
        return streak;
    };

    return (
        <div className="w-full h-full p-4 md:p-8 pb-12 md:pb-32">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Habit Tracker</h2>
                    <p className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Build consistency, one day at a time.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    style={{
                        backgroundColor: isDark ? '#ffffff' : '#000000',
                        color: isDark ? '#000000' : '#ffffff'
                    }}
                >
                    <Plus size={20} />
                    New Habit
                </button>
            </header>

            <AnimatePresence>
                {showAddForm && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleCreateHabit}
                        className={`mb-8 p-6 rounded-3xl border overflow-hidden ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'}`}
                    >
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Habit Title (e.g., Read 30 mins)"
                                value={newHabit.title}
                                onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                                required
                                className={`w-full p-4 rounded-xl outline-none border transition-all ${isDark ? 'bg-zinc-900 border-zinc-700 focus:border-white text-white' : 'bg-gray-50 border-gray-200 focus:border-black text-gray-900'}`}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className={`px-6 py-2 rounded-xl font-medium ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25 transition-all"
                                >
                                    Create Habit
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Saved Habits History & Performance Chart Layout */}
            <div className="flex flex-col gap-8 mb-8">
                {/* Chart Section */}
                <div className={`p-4 md:p-8 rounded-3xl border ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-purple-500" size={24} />
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance Growth</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={stats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
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
                                    interval={0}
                                />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#18181b' : '#fff',
                                        borderRadius: '12px',
                                        border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: isDark ? '#fff' : '#000' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#habitGradient)"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Saved Habits Log */}
                <div className={`p-4 md:p-6 rounded-3xl border ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-xl'} overflow-hidden flex flex-col`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Check className="text-green-500" size={20} />
                        </div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Saved Habits</h3>
                    </div>

                    <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[300px]">
                        <div className="space-y-4">
                            {habits.flatMap(h => h.completedDates.map(d => ({
                                title: h.title,
                                date: new Date(d),
                                id: h._id + d
                            })))
                                .sort((a, b) => b.date - a.date)
                                .slice(0, 50) // Limit to last 50 entries
                                .map((entry, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-zinc-200' : 'text-gray-900'}`}>{entry.title}</p>
                                            <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                                                {entry.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                ))}

                            {habits.every(h => h.completedDates.length === 0) && (
                                <div className={`text-center py-8 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
                                    <p>No completed habits yet.</p>
                                    <p className="text-xs mt-1">Complete a habit to save it here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Habits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map(habit => {
                    const completed = isCompletedToday(habit);
                    const streak = getStreak(habit);
                    // Mobile-friendly calendar toggle separate from main card click if needed
                    // Using a local state approach by creating a wrapper component or just extending this logic.
                    // Since we map, we can't easily use hooks inside the map unless we extract a component.
                    return (
                        <HabitCard
                            key={habit._id}
                            habit={habit}
                            isDark={isDark}
                            onToggle={(date) => toggleHabit(habit._id, date)}
                            onDelete={() => handleDeleteHabit(habit._id)}
                            completed={completed}
                            streak={streak}
                        />
                    );
                })}
            </div>
        </div >
    );
};

export default HabitTracker;
