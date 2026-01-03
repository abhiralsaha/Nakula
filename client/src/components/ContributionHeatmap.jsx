import React, { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ContributionHeatmap = ({ data = [] }) => {
    const [hoveredDay, setHoveredDay] = useState(null);
    const { isDark } = useTheme();

    // Theme-aware color palette
    const getColor = (count) => {
        if (isDark) {
            // Brighter colors for dark mode
            if (count === 0) return '#2d333b';  // Dark gray for empty
            if (count === 1) return '#0e4429';  // Dark green
            if (count <= 3) return '#006d32';   // Medium green
            if (count <= 5) return '#26a641';   // Bright green
            return '#39d353';                    // Neon green
        } else {
            // Softer colors for light mode
            if (count === 0) return '#e5e7eb';  // Light gray for empty
            if (count === 1) return '#9be9a8';  // Light green
            if (count <= 3) return '#40c463';   // Green
            if (count <= 5) return '#30a14e';   // Dark green
            return '#216e39';                    // Darkest green
        }
    };

    const { grid, months, stats } = useMemo(() => {
        // Build date -> count map
        const dateMap = new Map();
        data.forEach(item => {
            if (item.date) {
                const key = typeof item.date === 'string'
                    ? item.date.split('T')[0]
                    : new Date(item.date).toISOString().split('T')[0];
                dateMap.set(key, item.count || 0);
            }
        });

        const today = new Date();
        const currentYear = today.getFullYear();

        // Start from Jan 1st of current year
        const start = new Date(currentYear, 0, 1);

        // End at Dec 31st of current year (to show full year grid)
        const end = new Date(currentYear, 11, 31);

        // Align start to the previous Sunday for the grid
        const gridStart = new Date(start);
        gridStart.setDate(start.getDate() - start.getDay());

        const weeks = [];
        const monthPositions = [];
        let total = 0;
        let activeDays = 0;
        let maxStreak = 0;
        let streak = 0;
        let lastMonth = -1;

        let d = new Date(gridStart);
        let weekIdx = 0;

        // Render until the last week of the year is covered
        while (d <= end || d.getDay() !== 0) {
            const week = [];

            for (let i = 0; i < 7; i++) {
                const dateStr = d.toISOString().split('T')[0];
                const count = dateMap.get(dateStr) || 0;

                // Track month labels (only if within current year range)
                if (d >= start && d <= end && d.getMonth() !== lastMonth) {
                    monthPositions.push({
                        month: d.getMonth(),
                        position: weekIdx
                    });
                    lastMonth = d.getMonth();
                }

                // Stats (count only if within actual year)
                if (d.getFullYear() === currentYear) {
                    total += count;
                    if (count > 0) {
                        activeDays++;
                        streak++;
                        maxStreak = Math.max(maxStreak, streak);
                    } else {
                        streak = 0;
                    }
                }

                week.push({
                    date: dateStr,
                    count,
                    // Future if beyond today (but show the grid for the whole year)
                    future: d > today,
                    // Hide if outside the current year (padding days)
                    hidden: d.getFullYear() !== currentYear
                });

                d.setDate(d.getDate() + 1);
            }

            weeks.push(week);
            weekIdx++;

            // Safety break just in case
            if (weekIdx > 54) break;
        }

        return {
            grid: weeks,
            months: monthPositions,
            stats: { total, activeDays, maxStreak }
        };
    }, [data]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center gap-1">
                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>submissions in the past one year</span>
                </div>
                <div className={`flex items-center gap-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Total active days: <span className={isDark ? 'text-white' : 'text-gray-900'}>{stats.activeDays}</span></span>
                    <span>Max streak: <span className={isDark ? 'text-green-400' : 'text-green-600'}>{stats.maxStreak}</span></span>
                </div>
            </div>

            {/* Grid Container */}
            <div className="overflow-x-auto">
                <div style={{ display: 'inline-block' }}>
                    {/* Heatmap Grid */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                        {grid.map((week, wIdx) => (
                            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {week.map((day, dIdx) => {
                                    const dayKey = `${wIdx}-${dIdx}`;
                                    const isHovered = hoveredDay === dayKey;
                                    return (
                                        <div
                                            key={dIdx}
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '2px',
                                                backgroundColor: day.future ? 'transparent' : getColor(day.count),
                                                cursor: day.future || day.hidden ? 'default' : 'pointer',
                                                position: 'relative',
                                                visibility: day.hidden ? 'hidden' : 'visible'
                                            }}
                                            onMouseEnter={() => !day.future && !day.hidden && setHoveredDay(dayKey)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        >
                                            {/* Hover Tooltip - only renders when this specific cell is hovered */}
                                            {!day.future && isHovered && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '100%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        marginBottom: '8px',
                                                        zIndex: 50,
                                                        pointerEvents: 'none'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            backgroundColor: '#24292f',
                                                            color: 'white',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            whiteSpace: 'nowrap',
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                                            border: '1px solid #444'
                                                        }}
                                                    >
                                                        <strong>{day.count} contributions</strong>
                                                        <span style={{ color: '#8b949e', marginLeft: '4px' }}>on {day.date}</span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            width: 0,
                                                            height: 0,
                                                            borderLeft: '6px solid transparent',
                                                            borderRight: '6px solid transparent',
                                                            borderTop: '6px solid #24292f',
                                                            margin: '0 auto'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Month Labels - Bottom */}
                    <div style={{ display: 'flex', marginTop: '4px', position: 'relative', height: '15px' }}>
                        {months.map((m, idx) => (
                            <span
                                key={idx}
                                style={{
                                    position: 'absolute',
                                    left: `${m.position * 13}px`,
                                    fontSize: '10px',
                                    color: '#7d8590'
                                }}
                            >
                                {monthNames[m.month]}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend - LeetCode style */}
            <div className="flex items-center justify-end gap-1 mt-2 text-xs text-gray-500">
                <span>Less</span>
                {[0, 1, 3, 5, 7].map((level) => (
                    <div
                        key={level}
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            backgroundColor: getColor(level)
                        }}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    );
};

export default ContributionHeatmap;
