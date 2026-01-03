import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Target, Clock, Map, Sun, Moon } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const CreateGoalModal = ({ isOpen, onClose, onGoalCreated, initialData, isEditing = false, initialStep = 1 }) => {
    const { isDark } = useTheme();
    const [step, setStep] = useState(initialStep);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        dailyRoutine: [],
        weeklyMap: []
    });

    // Load initial data on open
    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
                dailyRoutine: initialData.dailyRoutine || [],
                weeklyMap: initialData.weeklyMap || []
            });
            setStep(initialStep); // Set to requested step
        } else if (isOpen && !initialData) {
            // Reset if opening new
            setFormData({
                title: '',
                description: '',
                deadline: '',
                dailyRoutine: [],
                weeklyMap: []
            });
            setStep(1);
        }
    }, [isOpen, initialData, initialStep]);


    // Helper to add routine row
    const addRoutineRow = () => {
        setFormData({
            ...formData,
            dailyRoutine: [...formData.dailyRoutine, { timeSlot: '', period: '', activity: '', intensity: 'Low' }]
        });
    };

    // Helper to add weekly map week
    const addWeek = () => {
        setFormData({
            ...formData,
            weeklyMap: [...formData.weeklyMap, {
                week: formData.weeklyMap.length + 1,
                phase: 'Custom Phase',
                topic: '',
                morningMission: '',
                nightMission: '',
                days: Array(7).fill({ day: 'Day', morningTask: '', nightTask: '' }).map((_, i) => ({ day: `Day ${i + 1}`, morningTask: '', nightTask: '' }))
            }]
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let res;
            if (isEditing && initialData._id) {
                res = await api.put(`/goals/${initialData._id}`, formData);
                toast.success('Goal updated successfully!');
            } else {
                res = await api.post('/goals', formData);
                toast.success('Goal created successfully!');
            }
            onGoalCreated(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save goal');
        } finally {
            setLoading(false);
        }
    };

    // Use Portal with AnimatePresence for proper enter/exit animations
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        className={`w-full h-full md:w-[95%] md:h-[90%] md:max-w-4xl md:rounded-2xl flex flex-col shadow-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}
                    >
                        {/* Header */}
                        <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'bg-[#27272a] border-[#3f3f46]' : 'bg-gray-100 border-gray-200'}`}>
                            <div>
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEditing ? 'Edit Goal & Schedule' : 'Create New Goal'}</h2>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Step {step} of 3: {step === 1 ? 'Goal Details' : step === 2 ? 'Daily Routine' : 'Weekly Battle Map'}</p>
                            </div>
                            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'}`}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className={`w-full h-1 ${isDark ? 'bg-[#3f3f46]' : 'bg-gray-200'}`}>
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
                        </div>

                        {/* Body - Scrollable */}
                        <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${step > 1 ? (isDark ? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#18181b] [&::-webkit-scrollbar-thumb]:bg-[#3f3f46] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#52525b]' : '') : ''}`}>
                            {step === 1 && (
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Goal Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className={`w-full border rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                            placeholder="e.g. Marathon Training"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className={`w-full border rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all h-32 resize-none ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                            placeholder="Describe your goal..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Deadline</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                            className={`w-full border rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-gray-50 border-gray-200 text-gray-900 [color-scheme:light]'}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><Clock className="text-blue-400" /> Define Daily Routine</h3>
                                        <button onClick={addRoutineRow} className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isDark ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                                            <Plus size={16} /> Add Slot
                                        </button>
                                    </div>

                                    <div className={`rounded-xl border flex flex-col ${isDark ? 'border-[#3f3f46]' : 'border-gray-200'}`} style={{ maxHeight: '60vh' }}>
                                        <div className="overflow-auto custom-scrollbar rounded-xl">
                                            <table className="w-full min-w-[600px] text-left border-collapse relative">
                                                <thead className={`text-xs uppercase tracking-wider sticky top-0 z-10 ${isDark ? 'bg-[#27272a] text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                                                    <tr>
                                                        <th className="p-4 w-[140px] whitespace-nowrap">Time</th>
                                                        <th className="p-4 w-[140px] whitespace-nowrap">Period</th>
                                                        <th className="p-4 whitespace-nowrap">Activity</th>
                                                        <th className="p-4 w-[120px] whitespace-nowrap">Intensity</th>
                                                        <th className="p-4 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y ${isDark ? 'divide-[#3f3f46]' : 'divide-gray-200'}`}>
                                                    {formData.dailyRoutine.map((item, idx) => (
                                                        <tr key={idx} className={`group ${isDark ? 'hover:bg-[#27272a]/50' : 'hover:bg-gray-50'}`}>
                                                            <td className="p-3 align-top">
                                                                <input
                                                                    value={item.timeSlot}
                                                                    onChange={e => {
                                                                        const newRoutine = [...formData.dailyRoutine];
                                                                        newRoutine[idx].timeSlot = e.target.value;
                                                                        setFormData({ ...formData, dailyRoutine: newRoutine });
                                                                    }}
                                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                                                    placeholder="00:00 - 00:00"
                                                                />
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                <input
                                                                    value={item.period}
                                                                    onChange={e => {
                                                                        const newRoutine = [...formData.dailyRoutine];
                                                                        newRoutine[idx].period = e.target.value;
                                                                        setFormData({ ...formData, dailyRoutine: newRoutine });
                                                                    }}
                                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                                                    placeholder="Period"
                                                                />
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                <textarea
                                                                    value={item.activity}
                                                                    onChange={e => {
                                                                        const newRoutine = [...formData.dailyRoutine];
                                                                        newRoutine[idx].activity = e.target.value;
                                                                        setFormData({ ...formData, dailyRoutine: newRoutine });
                                                                    }}
                                                                    rows={1}
                                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors resize-none min-h-[38px] ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                                                    placeholder="Activity description..."
                                                                />
                                                            </td>
                                                            <td className="p-3 align-top">
                                                                <select
                                                                    value={item.intensity}
                                                                    onChange={e => {
                                                                        const newRoutine = [...formData.dailyRoutine];
                                                                        newRoutine[idx].intensity = e.target.value;
                                                                        setFormData({ ...formData, dailyRoutine: newRoutine });
                                                                    }}
                                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none cursor-pointer ${isDark ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                                >
                                                                    <option value="Low">Low</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="High">High</option>
                                                                    <option value="Extreme">Extreme</option>
                                                                    <option value="Rest">Rest</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-3 align-top text-center pt-4">
                                                                <button
                                                                    onClick={() => {
                                                                        const newRoutine = formData.dailyRoutine.filter((_, i) => i !== idx);
                                                                        setFormData({ ...formData, dailyRoutine: newRoutine });
                                                                    }}
                                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {formData.dailyRoutine.length === 0 && (
                                            <div className="text-center py-10 text-gray-500 text-sm border-t border-dashed border-gray-200 dark:border-[#3f3f46]">
                                                No routine items. Click "Add Slot" to start.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><Map className="text-purple-400" /> Define Weekly Battle Map</h3>
                                        <button onClick={addWeek} className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isDark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
                                            <Plus size={16} /> Add Week
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {formData.weeklyMap.map((week, idx) => (
                                            <div key={idx} className={`rounded-xl overflow-hidden border ${isDark ? 'bg-[#27272a] border-[#3f3f46]' : 'bg-gray-50 border-gray-200'}`}>
                                                {/* Header Row */}
                                                <div className={`flex flex-col md:flex-row justify-between md:items-center p-3 border-b gap-3 ${isDark ? 'bg-[#3f3f46]/30 border-[#3f3f46]' : 'bg-gray-100 border-gray-200'}`}>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 ${isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-600 border-purple-200'}`}>
                                                            {week.week}
                                                        </div>
                                                        <input
                                                            placeholder="Topic / Focus"
                                                            value={week.topic}
                                                            onChange={e => {
                                                                const newMap = [...formData.weeklyMap];
                                                                newMap[idx].topic = e.target.value;
                                                                setFormData({ ...formData, weeklyMap: newMap });
                                                            }}
                                                            className={`font-bold outline-none w-full md:w-48 focus:border-b border-purple-500/50 bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newMap = formData.weeklyMap.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, weeklyMap: newMap });
                                                        }}
                                                        className="text-gray-500 hover:text-red-400 p-1 self-end md:self-auto"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Phase</label>
                                                        <input
                                                            placeholder="e.g. Phase 1"
                                                            value={week.phase}
                                                            onChange={e => {
                                                                const newMap = [...formData.weeklyMap];
                                                                newMap[idx].phase = e.target.value;
                                                                setFormData({ ...formData, weeklyMap: newMap });
                                                            }}
                                                            className={`w-full p-2 rounded-lg text-sm border outline-none focus:border-purple-500/50 transition-colors ${isDark ? 'bg-[#18181b] text-gray-300 border-[#3f3f46]' : 'bg-white text-gray-700 border-gray-300'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase text-orange-400/80 font-bold mb-1 block flex items-center gap-1"><Sun size={10} /> Morning Mission</label>
                                                        <input
                                                            placeholder="Key Objective"
                                                            value={week.morningMission}
                                                            onChange={e => {
                                                                const newMap = [...formData.weeklyMap];
                                                                newMap[idx].morningMission = e.target.value;
                                                                setFormData({ ...formData, weeklyMap: newMap });
                                                            }}
                                                            className={`w-full p-2 rounded-lg text-sm border outline-none focus:border-orange-500/50 transition-colors ${isDark ? 'bg-[#18181b] text-gray-300 border-[#3f3f46]' : 'bg-white text-gray-700 border-gray-300'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase text-indigo-400/80 font-bold mb-1 block flex items-center gap-1"><Moon size={10} /> Night Mission</label>
                                                        <input
                                                            placeholder="Review / Practice"
                                                            value={week.nightMission}
                                                            onChange={e => {
                                                                const newMap = [...formData.weeklyMap];
                                                                newMap[idx].nightMission = e.target.value;
                                                                setFormData({ ...formData, weeklyMap: newMap });
                                                            }}
                                                            className={`w-full p-2 rounded-lg text-sm border outline-none focus:border-indigo-500/50 transition-colors ${isDark ? 'bg-[#18181b] text-gray-300 border-[#3f3f46]' : 'bg-white text-gray-700 border-gray-300'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.weeklyMap.length === 0 && (
                                            <div className={`text-center py-10 text-gray-500 rounded-xl border border-dashed ${isDark ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-gray-50 border-gray-300'}`}>
                                                No weeks added. Click "Add Week" to build your roadmap.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`p-6 border-t flex justify-between items-center ${isDark ? 'border-[#3f3f46] bg-[#27272a]' : 'border-gray-200 bg-gray-50'}`}>
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 shadow-sm'}`}
                                >
                                    <ChevronLeft size={18} /> Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'}`}
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                                >
                                    {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Goal')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CreateGoalModal;
