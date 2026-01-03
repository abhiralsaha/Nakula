import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ContributionHeatmap from './ContributionHeatmap';
import { Flame, TrendingUp, Zap, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Premium Card Component with Gradient Border
const MetricCard = ({ label, value, subtext, gradient, icon: Icon, delay = 0, isDark }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative group"
        >
            {/* Gradient Border Effect */}
            <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 blur-sm transition-opacity duration-500`} />

            {/* Card Content */}
            <div className={`relative rounded-3xl p-6 h-full border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-lg'}`}>
                {/* Background Glow */}
                {isDark && (
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} opacity-10 blur-[60px] rounded-full`} />
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <Icon size={20} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{label}</span>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center relative z-10">
                    <div className="relative w-[140px] h-[140px]">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                            {/* Background Track */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                                strokeWidth="10"
                                fill="none"
                            />
                            {/* Progress Arc */}
                            <motion.circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke="url(#gradient)"
                                strokeWidth="10"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.3 }}
                            />
                            {/* Gradient Definition */}
                            <defs>
                                <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={gradient.includes('amber') ? '#fbbf24' : gradient.includes('cyan') ? '#22d3ee' : gradient.includes('purple') ? '#a855f7' : '#22c55e'} />
                                    <stop offset="100%" stopColor={gradient.includes('amber') ? '#f59e0b' : gradient.includes('cyan') ? '#06b6d4' : gradient.includes('purple') ? '#9333ea' : '#16a34a'} />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Center Value */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: delay + 0.5, type: "spring", stiffness: 200 }}
                                className={`text-4xl font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}
                            >
                                {value}
                            </motion.span>
                            <span className={`text-lg -mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>%</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 relative z-10">
                    <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{subtext}</p>
                </div>
            </div>
        </motion.div>
    );
};

const MomentumGraphs = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/momentum/graphs');
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-72 rounded-3xl animate-pulse ${isDark ? 'bg-zinc-900' : 'bg-gray-200'}`} />
                    ))}
                </div>
                <div className={`h-48 rounded-3xl animate-pulse ${isDark ? 'bg-zinc-900' : 'bg-gray-200'}`} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-center">
                <p className="font-medium">Failed to load momentum data. Please refresh.</p>
            </div>
        );
    }

    const metrics = [
        {
            label: "Discipline",
            value: data.metrics.discipline,
            subtext: data.counts.discipline,
            gradient: "from-amber-500 to-orange-600",
            icon: Flame
        },
        {
            label: "Consistency",
            value: data.metrics.consistency,
            subtext: data.counts.consistency,
            gradient: "from-cyan-400 to-blue-500",
            icon: TrendingUp
        },
        {
            label: "Performance",
            value: data.metrics.performance,
            subtext: data.counts.performance,
            gradient: "from-purple-500 to-pink-500",
            icon: Zap
        },
        {
            label: "Task Volume",
            value: data.metrics.task,
            subtext: data.counts.task,
            gradient: "from-emerald-400 to-green-600",
            icon: Target
        }
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}>
                        Momentum Engine
                    </h2>
                    <p className={`mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-600'}`}>Track your productivity metrics in real-time</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-sm font-medium">Live</span>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <MetricCard
                        key={metric.label}
                        {...metric}
                        delay={index * 0.1}
                        isDark={isDark}
                    />
                ))}
            </div>

            {/* Activity Heatmap Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`relative rounded-3xl p-6 border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-lg'}`}
            >
                <ContributionHeatmap data={data.heatmap} />
            </motion.div>
        </div>
    );
};

export default MomentumGraphs;

