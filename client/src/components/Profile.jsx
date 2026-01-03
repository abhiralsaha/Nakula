import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Bell, Smartphone, Mail, AlertTriangle, Shield, Check } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

const Profile = () => {
    const { user: authUser } = useAuth();
    const { isDark } = useTheme();

    // State
    const [userData, setUserData] = useState(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [preferences, setPreferences] = useState({
        sms: false,
        email: false,
        alarm: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/user');
            setUserData(res.data);
            setMobileNumber(res.data.mobileNumber || '');
            setPreferences({
                sms: res.data.notificationChannels?.includes('sms') || false,
                email: res.data.notificationChannels?.includes('email') || false,
                alarm: res.data.notificationChannels?.includes('alarm') || false
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleMobileSubmit = async () => {
        if (!mobileNumber) return toast.error('Please enter a valid number');

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: mobileNumber
            });
            if (error) throw error;

            setShowOtpInput(true);
            toast.success('OTP sent to ' + mobileNumber);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: mobileNumber,
                token: otp,
                type: 'sms'
            });
            if (error) throw error;

            toast.success('Phone verified successfully!');
            setShowOtpInput(false);

            // Re-fetch to sync with backend (AuthContext listens to changes, but explicit fetch helps DB sync)
            await new Promise(r => setTimeout(r, 1000)); // Wait for sync
            fetchUserData();

        } catch (err) {
            toast.error('Invalid OTP');
        }
    };

    const togglePreference = async (key) => {
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);

        // Convert obj to array for backend
        const channels = Object.keys(newPrefs).filter(k => newPrefs[k]);

        try {
            await api.put('/auth/preferences', {
                notificationChannels: channels
            });
            toast.success('Preferences updated');
        } catch (err) {
            toast.error('Failed to update preferences');
            // Revert on error
            setPreferences(preferences);
        }
    };

    if (loading) return <div>Loading...</div>;

    const cardClass = `p-6 rounded-3xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <header className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile & Settings</h1>
                <p className={isDark ? 'text-zinc-500' : 'text-gray-500'}>Manage your account and notification preferences.</p>
            </header>

            {/* Profile Info */}
            <div className={cardClass}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    Account Info
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{authUser?.email}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Username</label>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{userData?.username}</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

// Toggle Component
const Toggle = ({ label, description, active, onChange, isDark, disabled }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isDark ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
        <div>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
            onClick={!disabled ? onChange : undefined}
            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${active ? 'bg-indigo-500' : (isDark ? 'bg-zinc-700' : 'bg-gray-300')
                }`}
        >
            <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'
                }`} />
        </button>
    </div>
);

export default Profile;
