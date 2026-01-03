import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Modal Component - Accessible modal with animations and backdrop blur
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  const { isDark } = useTheme();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${sizes[size]} w-full pointer-events-auto`}
            >
              <div
                className={`rounded-2xl shadow-2xl overflow-hidden ${isDark
                    ? 'bg-zinc-900 border border-zinc-800'
                    : 'bg-white border border-gray-200'
                  } ${className}`}
              >
                {/* Header */}
                {title && (
                  <div
                    className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-gray-200'
                      }`}
                  >
                    <h2
                      className={`text-xl font-semibold ${isDark ? 'text-zinc-100' : 'text-gray-900'
                        }`}
                    >
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className={`p-2 rounded-lg transition-colors ${isDark
                          ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div
                    className={`px-6 py-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'
                      }`}
                  >
                    {footer}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
