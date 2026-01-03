import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Card Component - Base container with elevation and theme support
 */
const Card = ({
    children,
    className = '',
    hover = false,
    glass = false,
    padding = 'md',
    onClick,
    ...props
}) => {
    const { isDark } = useTheme();

    const baseStyles = 'rounded-2xl transition-all duration-200';

    const themeStyles = glass
        ? isDark
            ? 'bg-zinc-900/40 backdrop-blur-xl border border-zinc-800'
            : 'bg-white/40 backdrop-blur-xl border border-gray-200'
        : isDark
            ? 'bg-zinc-900 border border-zinc-800'
            : 'bg-white border border-gray-200';

    const hoverStyles = hover
        ? isDark
            ? 'hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50'
            : 'hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
        : '';

    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const cursorStyle = onClick ? 'cursor-pointer' : '';

    return (
        <motion.div
            whileHover={hover ? { y: -2 } : {}}
            className={`${baseStyles} ${themeStyles} ${hoverStyles} ${paddingStyles[padding]} ${cursorStyle} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
