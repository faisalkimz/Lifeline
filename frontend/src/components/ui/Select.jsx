import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const SelectContext = createContext({});

const Select = ({ children, value, onValueChange }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleValueChange = (newValue) => {
        onValueChange?.(newValue);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative w-full" ref={containerRef}>
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = ({ children, className }) => {
    const { open, setOpen } = useContext(SelectContext);

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950 dark:focus:ring-slate-300",
                className
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

const SelectValue = ({ placeholder }) => {
    const { value } = useContext(SelectContext);
    return <span>{value || placeholder}</span>;
};

const SelectContent = ({ children, className }) => {
    const { open } = useContext(SelectContext);

    if (!open) return null;

    return (
        <div
            className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 dark:text-slate-50",
                className
            )}
        >
            {children}
        </div>
    );
};

const SelectItem = ({ children, value: itemValue, className }) => {
    const { value: selectedValue, onValueChange } = useContext(SelectContext);
    const isSelected = selectedValue === itemValue;

    return (
        <div
            onClick={() => onValueChange(itemValue)}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800",
                isSelected && "bg-gray-100",
                className
            )}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
