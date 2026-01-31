import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext({});

// Support both controlled (open/onOpenChange) and uncontrolled usage (internal state)
const Dialog = ({ open: controlledOpen, onOpenChange: controlledOnOpenChange, children }) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

const DialogTrigger = ({ asChild, children }) => {
    const { onOpenChange } = useContext(DialogContext);

    const handleClick = () => onOpenChange?.(true);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: (e) => {
                // Call original onClick if exists
                children.props.onClick?.(e);
                handleClick();
            }
        });
    }

    return (
        <button onClick={handleClick}>
            {children}
        </button>
    );
};

import { X } from 'lucide-react';

const DialogContent = ({ children, className = "" }) => {
    const { open, onOpenChange } = useContext(DialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange?.(false)}
            />

            {/* Modal Content */}
            <div className={`relative bg-white dark:bg-slate-900 shadow-2xl w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl sm:max-h-[90vh] overflow-y-auto border-none sm:border sm:border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300 ${className}`}>
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-20"
                >
                    <X className="h-5 w-5" />
                </button>
                {children}
            </div>
        </div>
    );
};

const DialogHeader = ({ children, className = "" }) => (
    <div className={`p-6 border-b border-slate-100 dark:border-slate-800 ${className}`}>
        {children}
    </div>
);

const DialogTitle = ({ children, className = "" }) => (
    <h2 className={`text-xl font-bold text-slate-900 dark:text-white ${className}`}>
        {children}
    </h2>
);

const DialogDescription = ({ children, className = "" }) => (
    <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`}>
        {children}
    </p>
);

const DialogFooter = ({ children, className = "" }) => (
    <div className={`p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl ${className}`}>
        {children}
    </div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger };







