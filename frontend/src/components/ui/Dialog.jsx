import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog Content */}
            {children}
        </div>
    );
};

const DialogContent = ({ children, className = "" }) => (
    <div className={`relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden ${className}`}>
        {children}
    </div>
);

const DialogHeader = ({ children }) => (
    <div className="px-6 py-4 border-b border-gray-200">
        {children}
    </div>
);

const DialogTitle = ({ children, className = "" }) => (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
    </h2>
);

const DialogDescription = ({ children, className = "" }) => (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
        {children}
    </p>
);

const DialogFooter = ({ children }) => (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        {children}
    </div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };


