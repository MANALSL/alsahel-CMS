import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => (document.body.style.overflow = 'unset');
    }, [isOpen]);

    if (!isOpen) return null;

    // Size variants for different modal types
    const sizeClasses = {
        small: 'max-w-md',
        default: 'max-w-lg',
        large: 'max-w-3xl',
        xlarge: 'max-w-5xl',
        xxl: 'max-w-7xl',
        full: 'max-w-[95vw]'
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
                    >
                        {/* Fixed Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
