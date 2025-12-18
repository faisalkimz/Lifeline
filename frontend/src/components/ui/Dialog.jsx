import React, { createContext, useContext } from 'react';

const DialogContext = createContext({});

const Dialog = ({ open, onOpenChange, children }) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

const DialogTrigger = ({ asChild, children }) => {
    const { onOpenChange } = useContext(DialogContext);

    const handleClick = () => onOpenChange(true);

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

const DialogContent = ({ children, className = "" }) => {
    const { open, onOpenChange } = useContext(DialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal Content */}
            <div className={`relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-scale-in ${className}`}>
                {children}
            </div>
        </div>
    );
};

const DialogHeader = ({ children, className = "" }) => (
    <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>
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
    <div className={`px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-xl ${className}`}>
        {children}
    </div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger };







