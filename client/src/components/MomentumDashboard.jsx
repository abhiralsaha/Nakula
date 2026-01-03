import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, TrendingUp, AlertTriangle, Heart } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MomentumGraphs from './MomentumGraphs';

const MomentumDashboard = () => {
    const { user } = useAuth();
    const [momentum, setMomentum] = useState({
        consistencyScore: 50,
        level: 1,
        levelInfo: { name: 'Novice', color: '#8e8e93', theme: 'soft' },
        currentVelocity: 0,
        volatilityIndex: 50,
        resilienceScore: 50,
        emergencyModeActive: false,
        inPenaltyBox: false,
        dailyStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMomentum();
    }, []);

    const fetchMomentum = async () => {
        try {
            const res = await api.get('/momentum');
            setMomentum(res.data);
        } catch (err) {
            console.error('Error fetching momentum:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleEmergencyMode = async () => {
        try {
            const res = await api.post('/momentum/emergency');
            setMomentum({ ...momentum, emergencyModeActive: res.data.emergencyModeActive });
        } catch (err) {
            console.error('Error toggling emergency mode:', err);
        }
    };

    const getHealthBarColor = (score) => {
        if (score >= 80) return 'var(--accent-green)';
        if (score >= 60) return 'var(--accent-blue)';
        if (score >= 40) return 'var(--accent-orange)';
        if (score >= 20) return 'var(--accent-red)';
        return '#636366';
    };

    const getLevelGradient = (level) => {
        const gradients = {
            1: 'linear-gradient(135deg, #636366 0%, #8e8e93 100%)',
            2: 'linear-gradient(135deg, #30d158 0%, #64d2ff 100%)',
            3: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
            4: 'linear-gradient(135deg, #bf5af2 0%, #ff375f 100%)',
            5: 'linear-gradient(135deg, #ffd60a 0%, #ff9f0a 100%)'
        };
        return gradients[level] || gradients[1];
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400">Loading momentum...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <header className="mb-10">
                <h2 className="text-4xl font-bold tracking-tight mb-2">Momentum Engine</h2>
                <p className="text-gray-400 text-lg">Your consistency health at a glance.</p>
            </header>

            {/* Penalty Box Warning */}
            {momentum.inPenaltyBox && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl flex items-center gap-4"
                    style={{ background: 'rgba(255, 69, 58, 0.2)', border: '1px solid rgba(255, 69, 58, 0.4)' }}
                >
                    <AlertTriangle size={24} className="text-red-500" />
                    <div>
                        <p className="font-bold text-white">Penalty Box Active</p>
                        <p className="text-sm text-gray-400">Complete 3 tasks in a row to unlock all features.</p>
                    </div>
                </motion.div>
            )}

            {/* Main Health Bar Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card mb-8 relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: getLevelGradient(momentum.level) }}
                        >
                            <Heart size={32} className="text-white" fill="white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Consistency Health</h3>
                            <p className="text-gray-400">
                                Level {momentum.level} • {momentum.levelInfo.name}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-5xl font-bold" style={{ color: getHealthBarColor(momentum.consistencyScore) }}>
                            {momentum.consistencyScore}%
                        </p>
                    </div>
                </div>

                {/* Health Bar */}
                <div className="w-full bg-white/10 h-6 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${momentum.consistencyScore}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${getHealthBarColor(momentum.consistencyScore)}, ${getHealthBarColor(momentum.consistencyScore)}80)`,
                            boxShadow: `0 0 20px ${getHealthBarColor(momentum.consistencyScore)}50`
                        }}
                    />
                </div>

                <div className="flex justify-between text-sm text-gray-400">
                    <span>Critical</span>
                    <span>Recovering</span>
                    <span>Stable</span>
                    <span>Strong</span>
                    <span>Peak</span>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Velocity */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/20">
                            <Zap size={20} className="text-blue-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Velocity</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{momentum.currentVelocity}</p>
                    <p className="text-sm text-gray-400 mt-1">tasks/hour peak</p>
                </motion.div>

                {/* Volatility */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <Activity size={20} className="text-purple-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Volatility</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{momentum.volatilityIndex}</p>
                    <p className="text-sm text-gray-400 mt-1">{momentum.volatilityIndex < 30 ? 'Steady' : momentum.volatilityIndex < 60 ? 'Variable' : 'Erratic'}</p>
                </motion.div>

                {/* Resilience */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-green-500/20">
                            <Shield size={20} className="text-green-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Resilience</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{momentum.resilienceScore}</p>
                    <p className="text-sm text-gray-400 mt-1">comeback score</p>
                </motion.div>

                {/* Level Progress */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-orange-500/20">
                            <TrendingUp size={20} className="text-orange-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Level</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{momentum.level}</p>
                    <p className="text-sm text-gray-400 mt-1">{momentum.levelInfo.name}</p>
                </motion.div>
            </div>

            {/* NEW: 4-Graph System and Heatmap */}
            <div className="mb-8">
                <MomentumGraphs />
            </div>

            {/* Emergency Mode Toggle */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass-card cursor-pointer"
                onClick={toggleEmergencyMode}
                style={{
                    background: momentum.emergencyModeActive
                        ? 'rgba(255, 69, 58, 0.2)'
                        : undefined,
                    borderColor: momentum.emergencyModeActive
                        ? 'rgba(255, 69, 58, 0.4)'
                        : undefined
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${momentum.emergencyModeActive ? 'bg-red-500' : 'bg-white/10'}`}>
                            <AlertTriangle size={24} className={momentum.emergencyModeActive ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white">Emergency Mode</h4>
                            <p className="text-gray-400">
                                {momentum.emergencyModeActive
                                    ? 'Only non-negotiable tasks are visible'
                                    : 'Click to activate for low-energy days'}
                            </p>
                        </div>
                    </div>
                    <div className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors ${momentum.emergencyModeActive ? 'bg-red-500' : 'bg-white/10'}`}>
                        <motion.div
                            className="w-6 h-6 bg-white rounded-full"
                            animate={{ x: momentum.emergencyModeActive ? 22 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MomentumDashboard;
