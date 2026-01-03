import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, Plus, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import DailyRoutineTable from './DailyRoutineTable';
import WeeklyMapTable from './WeeklyMapTable';
import CreateGoalModal from './CreateGoalModal';
import { useTheme } from '../context/ThemeContext';

const GoalSection = () => {
    const { user, setUser } = useAuth();
    const { isDark } = useTheme();
    const [goals, setGoals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState(null); // null means "General"
    const [editingGoal, setEditingGoal] = useState(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(res.data);
        } catch (err) {
            console.error('Error fetching goals:', err);
        }
    };

    const handleGoalCreated = (savedGoal) => {
        // If editing, replace. If new, add.
        const exists = goals.find(g => g._id === savedGoal._id);
        if (exists) {
            setGoals(goals.map(g => g._id === savedGoal._id ? savedGoal : g));
        } else {
            setGoals([...goals, savedGoal]);
        }
    };

    const deleteGoal = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this goal? This will also delete its schedule.')) return;

        try {
            await api.delete(`/goals/${id}`);
            setGoals(goals.filter(g => g._id !== id));
            if (selectedGoalId === id) setSelectedGoalId(null);
            toast.success('Goal deleted');
        } catch (err) {
            console.error('Error deleting goal:', err);
            toast.error('Failed to delete goal');
        }
    };

    const openEditModal = async (goal, e, step = 1) => {
        if (e) e.stopPropagation();
        try {
            // Fetch full details (schedule) for this goal before opening
            const [routineRes, mapRes] = await Promise.all([
                api.get(`/schedule/daily?goalId=${goal._id}`),
                api.get(`/schedule/weekly?goalId=${goal._id}`)
            ]);

            const fullGoalData = {
                ...goal,
                dailyRoutine: routineRes.data,
                weeklyMap: mapRes.data
            };

            setEditingGoal({ ...fullGoalData, initialStep: step });
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching goal details:', err);
            toast.error('Failed to load goal details');
        }
    };

    const completeGoal = async (id, e) => {
        e.stopPropagation(); // Prevent card click
        try {
            const res = await api.put(`/goals/${id}`, { completed: true, progress: 100 });
            setGoals(goals.map(g => g._id === id ? res.data : g));

            // Update local user points
            if (user) {
                setUser({ ...user, points: (user.points || 0) + 100 });
            }
            alert('Goal Completed! You earned 100 points!');
        } catch (err) {
            console.error('Error completing goal:', err);
        }
    };

    // Helper to get gradient based on index
    const getGradient = (index) => {
        const gradients = [
            'from-blue-500 to-cyan-400',
            'from-orange-500 to-yellow-400',
            'from-green-500 to-emerald-400',
            'from-purple-500 to-pink-400',
            'from-red-500 to-rose-400'
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="w-full">
            <header className={`sticky top-0 z-20 mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-center gap-4 py-4 backdrop-blur-xl border-b -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-none ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
                <div>
                    <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Goals & Schedule</h2>
                    <p className={`text-base md:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedGoalId
                            ? `Focusing on: ${goals.find(g => g._id === selectedGoalId)?.title || 'Goal'}`
                            : 'Your roadmap to success and daily battles.'}
                    </p>
                    {selectedGoalId && (
                        <button
                            onClick={() => setSelectedGoalId(null)}
                            className={`text-sm underline mt-1 flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                            <ChevronLeft size={14} /> Back to General Schedule
                        </button>
                    )}
                </div>
                <button
                    onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> New Goal
                </button>
            </header>

            {/* Daily Routine Table - Main Focus */}
            {selectedGoalId ? (
                <DailyRoutineTable
                    goalId={selectedGoalId}
                    onEdit={() => {
                        const goal = goals.find(g => g._id === selectedGoalId);
                        if (goal) openEditModal(goal, null, 2);
                    }}
                />
            ) : (
                <div className={`text-center py-10 mb-8 border rounded-3xl backdrop-blur-sm ${isDark ? 'border-white/5 bg-black/20 text-gray-400' : 'border-gray-200 bg-white/50 text-gray-500'}`}>
                    <p>Select a Goal above to view its Daily Routine</p>
                </div>
            )}

            {/* Existing Goals Grid */}
            <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal, index) => (
                        <motion.div
                            key={goal._id}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => setSelectedGoalId(goal._id === selectedGoalId ? null : goal._id)}
                            className={`relative min-h-[220px] rounded-[32px] overflow-hidden shadow-2xl cursor-pointer group border ${selectedGoalId === goal._id ? 'border-blue-500 ring-2 ring-blue-500/50' : (isDark ? 'border-white/10' : 'border-gray-200')}`}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-90 transition-opacity group-hover:opacity-100`} />

                            {/* Content */}
                            <div className="relative z-10 h-full p-8 flex flex-col justify-between text-white">
                                <div className="flex justify-between items-start">
                                    <div className="bg-black/20 p-3 rounded-full backdrop-blur-md border border-white/10">
                                        <Target size={28} />
                                    </div>
                                    <div className="flex gap-2">
                                        {!goal.completed && (
                                            <button
                                                onClick={(e) => completeGoal(goal._id, e)}
                                                className="bg-black/20 hover:bg-black/40 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => openEditModal(goal, e)}
                                            className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
                                            title="Edit Goal & Schedule"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => deleteGoal(goal._id, e)}
                                            className="bg-black/20 hover:bg-red-500/40 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
                                            title="Delete Goal"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-3xl font-bold leading-tight tracking-tight mb-2">{goal.title}</h3>

                                    <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                                        <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full">
                                            <Calendar size={14} />
                                            {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="bg-black/10 px-3 py-1 rounded-full">
                                            {goal.completed ? 'Completed' : 'On Track'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Weekly Battle Map - Long Term Plan */}
            {selectedGoalId ? (
                <WeeklyMapTable
                    goalId={selectedGoalId}
                    onEdit={() => {
                        const goal = goals.find(g => g._id === selectedGoalId);
                        if (goal) openEditModal(goal, null, 3);
                    }}
                />
            ) : (
                <div className={`text-center py-10 border rounded-3xl backdrop-blur-sm ${isDark ? 'border-white/5 bg-black/20 text-gray-400' : 'border-gray-200 bg-white/50 text-gray-500'}`}>
                    <p>Select a Goal above to view its Weekly Battle Map</p>
                </div>
            )}

            <CreateGoalModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingGoal(null); }}
                onGoalCreated={handleGoalCreated}
                initialData={editingGoal}
                isEditing={!!editingGoal}
                initialStep={editingGoal?.initialStep || 1}
            />
        </div>
    );
};

export default GoalSection;
