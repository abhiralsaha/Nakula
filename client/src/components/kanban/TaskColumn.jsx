import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTheme } from '../../context/ThemeContext';
import TaskCard from './TaskCard';

const TaskColumn = ({ id, title, color, tasks, onDeleteTask, onUpdateTask }) => {
    const { isDark } = useTheme();
    const { setNodeRef, isOver } = useDroppable({ id });

    const columnColors = {
        zinc: isDark ? 'border-zinc-700' : 'border-gray-300',
        blue: isDark ? 'border-blue-500/30' : 'border-blue-400/50',
        green: isDark ? 'border-green-500/30' : 'border-green-400/50',
    };

    const headerColors = {
        zinc: isDark ? 'text-zinc-300' : 'text-gray-700',
        blue: isDark ? 'text-blue-400' : 'text-blue-600',
        green: isDark ? 'text-green-400' : 'text-green-600',
    };

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full rounded-2xl border-2 transition-all ${columnColors[color]
                } ${isOver ? 'bg-zinc-800/50' : isDark ? 'bg-zinc-900/30' : 'bg-gray-50'}`}
        >
            {/* Column Header */}
            <div className="p-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}">
                <div className="flex items-center justify-between">
                    <h2 className={`font-semibold text-lg ${headerColors[color]}`}>
                        {title}
                    </h2>
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${isDark
                                ? 'bg-zinc-800 text-zinc-400'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <SortableContext
                    items={tasks.map((task) => task._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 ? (
                        <div
                            className={`text-center py-8 ${isDark ? 'text-zinc-600' : 'text-gray-400'
                                }`}
                        >
                            <p className="text-sm">No tasks</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onDelete={onDeleteTask}
                                onUpdate={onUpdateTask}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default TaskColumn;
