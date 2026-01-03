import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, X, GripVertical, Calendar, Clock } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const TaskList = () => {
    const { isDark } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        type: 'Personal',
        priority: 2,
        date: '',
        time: ''
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setNewTask({ title: '', description: '', type: 'Personal', priority: 2, date: '', time: '' });
    };

    const createTask = async (e) => {
        e.preventDefault();
        try {
            let dueDate = null;
            if (newTask.date) {
                const dateTimeString = newTask.time ? `${newTask.date}T${newTask.time}` : newTask.date;
                dueDate = new Date(dateTimeString);
            }

            const taskPayload = {
                ...newTask,
                dueDate: dueDate
            };

            const res = await api.post('/tasks', taskPayload);
            setTasks([res.data, ...tasks]); // Add to top for immediate feedback
            handleCancel(); // Reset and close
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };

    const deleteTask = async (id) => {
        try {
            // Optimistic update
            setTasks(tasks.filter(task => task._id !== id));
            await api.delete(`/tasks/${id}`);
        } catch (err) {
            console.error('Error deleting task:', err);
            const errorMsg = err.response?.data?.msg || 'Failed to delete task';
            toast.error(errorMsg);
            fetchTasks(); // Revert on error
        }
    };

    const toggleTask = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            // Optimistic update
            setTasks(tasks.map(task =>
                task._id === id ? { ...task, status: newStatus } : task
            ));

            const res = await api.put(`/tasks/${id}`, { status: newStatus });
            // Ensure we sync with server response to get any side effects (like updated points)
            setTasks(tasks.map(task => task._id === id ? res.data : task));
        } catch (err) {
            console.error('Error updating task:', err);
            fetchTasks(); // Revert
        }
    };

    const handleReorder = (newOrder) => {
        setTasks(newOrder);
        // Debounce or just fire and forget for now (could be improved with debounce)
        api.patch('/tasks/reorder', { tasks: newOrder }).catch(err => {
            console.error('Error reordering:', err);
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(date);
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'all') return task.status !== 'completed';
        if (activeTab === 'active') return task.status === 'pending';
        if (activeTab === 'completed') return task.status === 'completed';
        return true;
    });

    const priorityColors = {
        1: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', label: 'Low' },
        2: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', label: 'Medium' },
        3: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', label: 'High' },
    };

    const typeColors = {
        'Personal': 'bg-blue-500/10 border-blue-500/30 text-blue-500',
        'Work': 'bg-purple-500/10 border-purple-500/30 text-purple-500',
        'Health': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    };

    return (
        <div className="w-full h-full p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}>Daily Planner</h2>
                    <p className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Manage your tasks and stay productive</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${isDark
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        }`}
                >
                    <Plus size={20} />
                    Add Task
                </button>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 mb-6 p-1 rounded-xl w-max max-w-full overflow-x-auto custom-scrollbar ${isDark ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                {['all', 'active', 'completed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === tab
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                            : isDark
                                ? 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                : 'bg-white border-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-3 relative min-h-[200px]">
                {filteredTasks.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <p>No tasks found. Create your first task!</p>
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={tasks} onReorder={handleReorder} className="space-y-3">
                        <AnimatePresence mode='popLayout'>
                            {filteredTasks.map((task) => {
                                const priority = priorityColors[task.priority || 2];
                                return (
                                    <Reorder.Item
                                        key={task._id}
                                        value={task}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.9,
                                            height: 0,
                                            marginBottom: 0,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileDrag={{ scale: 1.02 }}
                                        className={`rounded-xl border group ${isDark
                                            ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="p-5 flex items-start gap-4">
                                            {/* Drag Handle */}
                                            <div className={`cursor-grab active:cursor-grabbing mt-1 ${isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-gray-300 hover:text-gray-500'}`}>
                                                <GripVertical size={20} />
                                            </div>

                                            {/* Checkbox */}
                                            <div className="relative flex items-center justify-center mt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={task.status === 'completed'}
                                                    onChange={() => toggleTask(task._id, task.status)}
                                                    className={`appearance-none w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${task.status === 'completed'
                                                        ? 'bg-green-500 border-green-500'
                                                        : isDark ? 'border-zinc-600 hover:border-zinc-400' : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                />
                                                {task.status === 'completed' && (
                                                    <motion.svg
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute w-4 h-4 text-white pointer-events-none"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </motion.svg>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3
                                                        className={`text-lg font-semibold truncate transition-all ${task.status === 'completed'
                                                            ? 'line-through text-zinc-500'
                                                            : isDark ? 'text-zinc-100' : 'text-gray-900'
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </h3>
                                                    {task.dueDate && (
                                                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
                                                            <Calendar size={12} />
                                                            {formatDate(task.dueDate)}
                                                        </div>
                                                    )}
                                                </div>

                                                {task.description && (
                                                    <p className={`text-sm mb-3 truncate ${isDark ? 'text-zinc-400' : 'text-gray-500'} ${task.status === 'completed' && 'opacity-50'}`}>
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div className={`flex flex-wrap gap-2 transition-opacity ${task.status === 'completed' ? 'opacity-50' : 'opacity-100'}`}>
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${priority.bg} ${priority.border} ${priority.text}`}>
                                                        {priority.label}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${typeColors[task.type] || typeColors['Personal']}`}>
                                                        {task.type}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => deleteTask(task._id)}
                                                className={`p-2 rounded-lg transition-all ${isDark
                                                    ? 'hover:bg-red-500/10 text-zinc-500 hover:text-red-400'
                                                    : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                                    }`}
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </Reorder.Item>
                                );
                            })}
                        </AnimatePresence>
                    </Reorder.Group>
                )}
            </div>

            {/* Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleCancel}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-200'
                                    }`}
                            >
                                {/* Modal Header */}
                                <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                                    <h3 className={`text-xl font-semibold ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}>Create New Task</h3>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-opacity-80 ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={createTask} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            required
                                            autoFocus
                                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
                                                ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10'
                                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                }`}
                                            placeholder="Enter task title"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                            Description
                                        </label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            rows={3}
                                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${isDark
                                                ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10'
                                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                }`}
                                            placeholder="Add description..."
                                        />
                                    </div>

                                    {/* Date & Time Pickers */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="task-date" className={`block text-sm font-medium mb-2 flex items-center gap-2 cursor-pointer ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                                <Calendar size={16} /> Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="task-date"
                                                    type="date"
                                                    value={newTask.date}
                                                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                    className={`w-full px-4 py-3 rounded-xl border outline-none cursor-pointer ${isDark
                                                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-blue-500/50 [color-scheme:dark]'
                                                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="task-time" className={`block text-sm font-medium mb-2 flex items-center gap-2 cursor-pointer ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                                <Clock size={16} /> Time
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="task-time"
                                                    type="time"
                                                    value={newTask.time}
                                                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                    className={`w-full px-4 py-3 rounded-xl border outline-none cursor-pointer ${isDark
                                                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-blue-500/50 [color-scheme:dark]'
                                                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                                Priority
                                            </label>
                                            <select
                                                value={newTask.priority}
                                                onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                                                className={`w-full px-4 py-3 rounded-xl border outline-none appearance-none cursor-pointer ${isDark
                                                    ? 'bg-zinc-950 border-zinc-800 text-white focus:border-blue-500/50'
                                                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value={1}>Low</option>
                                                <option value={2}>Medium</option>
                                                <option value={3}>High</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                                Type
                                            </label>
                                            <select
                                                value={newTask.type}
                                                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                                                className={`w-full px-4 py-3 rounded-xl border outline-none appearance-none cursor-pointer ${isDark
                                                    ? 'bg-zinc-950 border-zinc-800 text-white focus:border-blue-500/50'
                                                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="Personal">Personal</option>
                                                <option value="Work">Work</option>
                                                <option value="Health">Health</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2 relative z-10">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleCancel();
                                            }}
                                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${isDark
                                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            Create Task
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default TaskList;
