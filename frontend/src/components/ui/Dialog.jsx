import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog Content */}
            {children}
        </div>
    );
};

const DialogContent = ({ children, className = "" }) => (
    <div className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden border dark:border-gray-800 ${className}`}>
        {children}
    </div>
);

const DialogHeader = ({ children }) => (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
        {children}
    </div>
);

const DialogTitle = ({ children, className = "" }) => (
    <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
        {children}
    </h2>
);

const DialogDescription = ({ children, className = "" }) => (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
        {children}
    </p>
);

const DialogFooter = ({ children }) => (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
        {children}
    </div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };







