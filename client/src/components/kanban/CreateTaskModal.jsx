import React, { useState } from 'react';
import { Calendar, Tag, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import { useTheme } from '../../context/ThemeContext';

const CreateTaskModal = ({ isOpen, onClose, onSubmit }) => {
    const { isDark } = useTheme();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 2,
        kanbanStatus: 'todo',
        labels: [],
        dueDate: '',
        type: 'todo',
    });

    const [currentLabel, setCurrentLabel] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddLabel = () => {
        if (currentLabel.trim() && !formData.labels.includes(currentLabel.trim())) {
            setFormData({
                ...formData,
                labels: [...formData.labels, currentLabel.trim()],
            });
            setCurrentLabel('');
        }
    };

    const handleRemoveLabel = (label) => {
        setFormData({
            ...formData,
            labels: formData.labels.filter((l) => l !== label),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            title: '',
            description: '',
            priority: 2,
            kanbanStatus: 'todo',
            labels: [],
            dueDate: '',
            type: 'todo',
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Task"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'
                            }`}
                    >
                        Task Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter task title"
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
                                ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                            }`}
                    />
                </div>

                {/* Description */}
                <div>
                    <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'
                            }`}
                    >
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Add a description..."
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${isDark
                                ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                            }`}
                    />
                </div>

                {/* Priority and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'
                                }`}
                        >
                            Priority
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border outline-none ${isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }`}
                        >
                            <option value={1}>Low</option>
                            <option value={2}>Medium</option>
                            <option value={3}>High</option>
                        </select>
                    </div>

                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'
                                }`}
                        >
                            Due Date
                        </label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border outline-none ${isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }`}
                        />
                    </div>
                </div>

                {/* Labels */}
                <div>
                    <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-700'
                            }`}
                    >
                        Labels
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={currentLabel}
                            onChange={(e) => setCurrentLabel(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddLabel();
                                }
                            }}
                            placeholder="Add a label..."
                            className={`flex-1 px-4 py-2 rounded-xl border outline-none ${isDark
                                    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                }`}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddLabel}
                        >
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.labels.map((label) => (
                            <span
                                key={label}
                                className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${isDark
                                        ? 'bg-zinc-800 text-zinc-300'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLabel(label)}
                                    className="hover:text-red-500"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                    >
                        Create Task
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
