import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, Tag, MoreVertical, Trash2, Edit, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../ui';

const TaskCard = ({ task, isOverlay, onDelete, onUpdate }) => {
    const { isDark } = useTheme();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
        1: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
        2: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
        3: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    };

    const priorityNames = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const priority = priorityColors[task.priority || 2];

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete(task._id);
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
                padding="sm"
                hover
                className={`cursor-grab active:cursor-grabbing group relative ${isOverlay ? 'shadow-2xl rotate-3' : ''
                    }`}
            >
                {/* Title & Delete */}
                <div className="flex justify-between items-start mb-2 group">
                    <h3
                        className={`font-semibold mr-2 ${isDark ? 'text-zinc-100' : 'text-gray-900'
                            }`}
                    >
                        {task.title}
                    </h3>
                    <button
                        onClick={handleDelete}
                        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all ${isDark
                            ? 'hover:bg-red-500/10 text-zinc-500 hover:text-red-400'
                            : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                            }`}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Description */}
                {task.description && (
                    <p
                        className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-gray-600'
                            }`}
                    >
                        {task.description}
                    </p>
                )}

                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {task.labels.map((label, index) => (
                            <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded-md ${isDark
                                    ? 'bg-zinc-800 text-zinc-300'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}">
                    {/* Priority */}
                    <span
                        className={`px-2 py-1 text-xs rounded-md border ${priority.bg} ${priority.border} ${priority.text}`}
                    >
                        {priorityNames[task.priority || 2]}
                    </span>

                    {/* Due Date */}
                    {task.dueDate && (
                        <div
                            className={`flex items-center gap-1 text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'
                                }`}
                        >
                            <Calendar size={14} />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TaskCard;
