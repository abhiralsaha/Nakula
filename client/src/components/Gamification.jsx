import React from 'react';
import { Trophy, Star, Gift, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Gamification = () => {
    const { user } = useAuth();

    const level = Math.floor((user?.points || 0) / 250) + 1;
    const nextLevelPoints = level * 250;
    const progress = ((user?.points || 0) % 250) / 250 * 100;

    return (
        <div className="w-full">
            <header className="mb-10 text-center">
                <h2 className="text-4xl font-bold tracking-tight mb-2">Achievements</h2>
                <p className="text-gray-400 text-lg">Your hall of fame.</p>
            </header>

            {/* Level Card */}
            <div className="relative overflow-hidden rounded-3xl p-6 md:p-10 text-white shadow-2xl mb-12 group" style={{ background: 'linear-gradient(135deg, #5e5ce6 0%, #bf5af2 50%, #ff375f 100%)' }}>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 text-center sm:text-left">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                            <Crown size={48} className="text-yellow-300 drop-shadow-lg" fill="currentColor" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                                <span className="bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Level {level}</span>
                                <span className="text-white/80 text-sm font-medium">Elite Member</span>
                            </div>
                            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Master Achiever</h3>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between text-sm mb-3 font-bold">
                            <span>Progress to Level {level + 1}</span>
                            <span>{user?.points || 0} / {nextLevelPoints} XP</span>
                        </div>
                        <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full"
                                style={{ boxShadow: '0 0 10px rgba(255,200,0,0.5)' }}
                            />
                        </div>
                        <p className="text-xs mt-3 text-white/80 text-right font-medium">Just {nextLevelPoints - (user?.points || 0)} XP to go!</p>
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <h3 className="text-2xl font-bold mb-6 tracking-tight">Recent Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                    { icon: <Zap size={32} />, title: '7 Day Streak', desc: 'Consistency is key', color: 'from-yellow-400 to-orange-500' },
                    { icon: <CheckCircleIcon />, title: 'Task Master', desc: '100 Tasks crushed', color: 'from-green-400 to-emerald-600' },
                    { icon: <Star size={32} />, title: 'Early Bird', desc: '5 AM Club member', color: 'from-blue-400 to-indigo-600' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -8 }}
                        className="glass-card p-6 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl -mr-8 -mt-8`} />
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                            {item.icon}
                        </div>
                        <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Rewards Shop */}
            <h3 className="text-2xl font-bold mb-6 tracking-tight">Rewards Shop</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { title: 'Dark Theme', cost: 500, icon: <Gift /> },
                    { title: 'Sound Pack', cost: 300, icon: <MusicIcon /> },
                    { title: 'Pro Badge', cost: 1000, icon: <Star /> },
                    { title: 'Export CSV', cost: 200, icon: <DownloadIcon /> },
                ].map((item, i) => (
                    <div key={i} className="glass-card p-6 text-center hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform border border-white/10">
                            {item.icon}
                        </div>
                        <h4 className="font-bold mb-1 text-sm">{item.title}</h4>
                        <p className="text-blue-400 font-bold text-xs bg-blue-500/10 py-1 px-2 rounded-full inline-block border border-blue-500/20">{item.cost} pts</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper Icons
const CheckCircleIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const MusicIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
const DownloadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

export default Gamification;
