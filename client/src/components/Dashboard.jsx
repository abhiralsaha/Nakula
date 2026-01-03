import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MomentumGraphs from './MomentumGraphs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import api from '../utils/api';

const Dashboard = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
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

    const [focusStats, setFocusStats] = useState({ chartData: generateEmptyData(), totalSeconds: 0, totalSessions: 0 });

    useEffect(() => {
        const fetchFocusStats = async () => {
            try {
                const res = await api.get('/focus/stats');
                setFocusStats(prev => ({
                    ...res.data,
                    chartData: res.data.chartData && res.data.chartData.length > 0 ? res.data.chartData : prev.chartData
                }));
            } catch (err) {
                console.error('Error fetching focus stats:', err);
            }
        };
        fetchFocusStats();
    }, []);

    return (
        <div className="w-full h-full pb-20">
            <header className="mb-8 md:mb-10">
                <h2 className={`text-3xl md:text-4xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
                <p className={`text-base md:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back, {user?.username}!</p>
            </header>

            {/* Focus Activity Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 md:p-8 rounded-3xl border mb-8 ${isDark ? 'bg-[#111] border-zinc-800' : 'bg-white border-gray-200 shadow-lg'}`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-zinc-200' : 'text-gray-800'}`}>Focus Activity</h3>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'}`}>Last 7 Days</div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart
                            data={focusStats.chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorFocusDash" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#bf5af2" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#bf5af2" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDark ? '#71717a' : '#9ca3af', fontSize: 12 }}
                                dy={10}
                                interval={0}
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
                                stroke="#bf5af2"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorFocusDash)"
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Momentum System Graphs (Requested 4-Metric System) */}
            <div className="w-full">
                <MomentumGraphs />
            </div>
        </div>
    );
};

export default Dashboard;
