import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const CardSkeleton = ({ count = 1 }) => {
    const { isDark } = useTheme();

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className={`rounded-2xl p-6 animate-pulse ${isDark ? 'bg-zinc-900' : 'bg-gray-100'
                        }`}
                >
                    <div className={`h-4 rounded mb-4 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '60%' }}></div>
                    <div className={`h-3 rounded mb-2 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '90%' }}></div>
                    <div className={`h-3 rounded ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '70%' }}></div>
                </div>
            ))}
        </>
    );
};

export const MetricSkeleton = ({ count = 4 }) => {
    const { isDark } = useTheme();

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className={`rounded-2xl p-6 animate-pulse ${isDark ? 'bg-zinc-900' : 'bg-gray-100'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}></div>
                    </div>
                    <div className={`h-3 rounded mb-2 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '50%' }}></div>
                    <div className={`h-8 rounded ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '40%' }}></div>
                </div>
            ))}
        </>
    );
};

export const TaskSkeleton = ({ count = 3 }) => {
    const { isDark } = useTheme();

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className={`rounded-xl p-4 border animate-pulse ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-200'
                        }`}
                >
                    <div className={`h-4 rounded mb-2 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '70%' }}></div>
                    <div className={`h-3 rounded ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`} style={{ width: '90%' }}></div>
                </div>
            ))}
        </>
    );
};

export const Spinner = ({ size = 'md' }) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    return (
        <div className={`animate-spin rounded-full border-zinc-400 border-t-transparent ${sizes[size]}`}></div>
    );
};
