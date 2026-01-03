import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Button Component - Apple-inspired design
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
    ...props
}) => {
    const { isDark } = useTheme();

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: isDark
            ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-400'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-600',
        secondary: isDark
            ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:ring-zinc-600'
            : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-300',
        ghost: isDark
            ? 'bg-transparent text-zinc-300 hover:bg-zinc-800/50 focus:ring-zinc-600'
            : 'bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3.5 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <motion.button
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : icon && iconPosition === 'left' ? (
                <span className="mr-2">{icon}</span>
            ) : null}

            {children}

            {icon && iconPosition === 'right' && !loading && (
                <span className="ml-2">{icon}</span>
            )}
        </motion.button>
    );
};

export default Button;
