import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Input Component - Enhanced input with floating labels and validation
 */
const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    icon,
    iconPosition = 'left',
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    const { isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = value && value.length > 0;
    const showFloatingLabel = label && (isFocused || hasValue);

    const baseStyles = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none';

    const themeStyles = isDark
        ? `bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 
       focus:border-zinc-600 focus:ring-2 focus:ring-zinc-800`
        : `bg-white border-gray-200 text-gray-900 placeholder-gray-400 
       focus:border-gray-400 focus:ring-2 focus:ring-gray-100`;

    const errorStyles = error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : '';

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const iconPadding = icon
        ? iconPosition === 'left'
            ? 'pl-11'
            : 'pr-11'
        : '';

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${isDark ? 'text-zinc-400' : 'text-gray-600'
                        } ${showFloatingLabel
                            ? '-top-2.5 text-xs bg-zinc-900 dark:bg-white px-2 font-medium'
                            : 'top-3.5 text-base'
                        }`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {icon && (
                <div
                    className={`absolute ${iconPosition === 'left' ? 'left-4' : 'right-4'
                        } top-1/2 transform -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-gray-400'
                        }`}
                >
                    {icon}
                </div>
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={showFloatingLabel ? '' : placeholder || label}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`${baseStyles} ${themeStyles} ${errorStyles} ${disabledStyles} ${iconPadding}`}
                {...props}
            />

            {error && (
                <p className="mt-1.5 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
