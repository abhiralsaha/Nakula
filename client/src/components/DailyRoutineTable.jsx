import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Battery, Activity, Coffee, Moon } from 'lucide-react';
import api from '../utils/api';

const DailyRoutineTable = ({ goalId = null, onEdit }) => {
    const [routine, setRoutine] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutine = async () => {
            setLoading(true);
            try {
                const res = await api.get('/schedule/daily', {
                    params: { goalId: goalId || 'null' }
                });
                setRoutine(res.data);
            } catch (err) {
                console.error("Error fetching daily routine:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutine();
    }, [goalId]);

    const getIntensityColor = (intensity) => {
        if (intensity.includes('Alert')) return 'text-yellow-400';
        if (intensity.includes('High') || intensity.includes('Extreme')) return 'text-red-400';
        if (intensity.includes('Passive') || intensity.includes('Rest')) return 'text-blue-400';
        if (intensity.includes('Work')) return 'text-green-400';
        return 'text-white';
    };

    if (loading) return <div className="text-white text-center py-10">Loading Schedule...</div>;

    return (
        <div className="w-full mb-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-black dark:text-[#e4e4e7] flex items-center gap-2">
                    <Clock className="text-blue-500 dark:text-blue-400" /> Daily Routine
                </h3>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                    >
                        Edit Routine
                    </button>
                )}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-[#3f3f46] shadow-xl dark:shadow-2xl bg-white/50 dark:bg-[#1e1e1e] backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100/50 dark:bg-[#27272a] text-black dark:text-[#e4e4e7] border-b border-gray-200 dark:border-[#3f3f46]">
                            <th className="p-4 font-bold text-sm uppercase tracking-wider">Time Slot</th>
                            <th className="p-4 font-bold text-sm uppercase tracking-wider">Period</th>
                            <th className="p-4 font-bold text-sm uppercase tracking-wider">Activity</th>
                            <th className="p-4 font-bold text-sm uppercase tracking-wider">Intensity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routine.map((item, index) => (
                            <motion.tr
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-100 dark:border-[#3f3f46] text-black dark:text-[#e4e4e7] hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors"
                            >
                                <td className="p-4 font-mono text-sm whitespace-nowrap text-blue-600 dark:text-blue-300 font-bold">{item.timeSlot}</td>
                                <td className="p-4 font-bold text-black dark:text-[#e4e4e7]">{item.period}</td>
                                <td className="p-4 text-sm leading-relaxed max-w-md font-medium text-black dark:text-[#e4e4e7]">{item.activity}</td>
                                <td className={`p-4 font-bold text-sm whitespace-nowrap ${getIntensityColor(item.intensity)}`}>
                                    {item.intensity}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailyRoutineTable;
