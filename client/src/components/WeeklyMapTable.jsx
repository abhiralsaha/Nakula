import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, ChevronDown, ChevronUp, BookOpen, Moon, Sun } from 'lucide-react';
import api from '../utils/api';

const WeeklyMapTable = ({ goalId = null, onEdit }) => {
    const [weeks, setWeeks] = useState([]);
    const [openWeek, setOpenWeek] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeekly = async () => {
            setLoading(true); // Reset loading on goal change
            try {
                const res = await api.get('/schedule/weekly', {
                    params: { goalId: goalId || 'null' }
                });
                setWeeks(res.data);
            } catch (err) {
                console.error("Error fetching weekly plan:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWeekly();
    }, [goalId]);

    const toggleWeek = (id) => {
        setOpenWeek(openWeek === id ? null : id);
    };

    if (loading) return <div className="text-white text-center py-10">Loading Battle Map...</div>;

    // Group by Phase
    const phases = {};
    weeks.forEach(week => {
        if (!phases[week.phase]) phases[week.phase] = [];
        phases[week.phase].push(week);
    });

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#e4e4e7] flex items-center gap-2">
                    <Map className="text-purple-400" /> Weekly Battle Map
                </h3>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-sm bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        Edit Map
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {Object.keys(phases).map((phaseTitle, phaseIndex) => (
                    <div key={phaseIndex} className="bg-[#1e1e1e] rounded-3xl p-6 border border-[#3f3f46] backdrop-blur-sm shadow-sm">
                        <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 px-2">
                            {phaseTitle}
                        </h4>

                        <div className="space-y-4">
                            {phases[phaseTitle].map((week, index) => (
                                <motion.div
                                    key={week._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="border border-[#3f3f46] rounded-xl overflow-hidden bg-[#27272a] hover:bg-[#3f3f46] transition-colors shadow-sm"
                                >
                                    <div
                                        onClick={() => toggleWeek(week._id)}
                                        className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer gap-4 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-purple-500/20 text-purple-300 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                                                W{week.week}
                                            </div>
                                            <div>
                                                <h5 className="text-lg font-bold text-[#e4e4e7] group-hover:text-purple-300 transition-colors">{week.topic}</h5>
                                                <p className="text-[#a1a1aa] text-sm hidden md:block">Click to expand details</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 w-full md:w-auto text-sm text-[#e4e4e7] pl-16 md:pl-0">
                                            {/* Summary Pills for Mobile/Desktop */}
                                            <div className="bg-[#18181b] rounded-lg px-3 py-1.5 flex items-center gap-2 border border-[#3f3f46]">
                                                <Sun size={14} className="text-orange-300" />
                                                <span className="truncate max-w-[100px] md:max-w-xs">{week.morningMission}</span>
                                            </div>
                                            {openWeek === week._id ? <ChevronUp className="text-[#a1a1aa]" /> : <ChevronDown className="text-[#a1a1aa]" />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {openWeek === week._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-6 pt-2 border-t border-[#3f3f46] bg-[#18181b]"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                    <h6 className="font-bold text-orange-200 mb-2 flex items-center gap-2"><Sun size={16} /> Morning Mission</h6>
                                                    <p className="text-sm text-gray-300">{week.morningMission}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                                    <h6 className="font-bold text-indigo-200 mb-2 flex items-center gap-2"><Moon size={16} /> Night Mission</h6>
                                                    <p className="text-sm text-gray-300">{week.nightMission}</p>
                                                </div>
                                            </div>

                                            {/* Daily Breakdown Table */}
                                            <div className="overflow-x-auto rounded-xl border border-white/10">
                                                <table className="w-full text-left text-sm text-gray-400">
                                                    <thead className="bg-white/5 text-gray-200">
                                                        <tr>
                                                            <th className="p-3">Day</th>
                                                            <th className="p-3">Morning Task</th>
                                                            <th className="p-3">Night Task</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {week.days.map((day, dIdx) => (
                                                            <tr key={dIdx} className="hover:bg-white/5">
                                                                <td className="p-3 font-bold text-white w-16">{day.day}</td>
                                                                <td className="p-3">{day.morningTask}</td>
                                                                <td className="p-3">{day.nightTask}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyMapTable;
