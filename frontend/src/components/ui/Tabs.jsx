import React from 'react';
import { cn } from '../../utils/cn';

const TabsContext = React.createContext();

export const Tabs = React.forwardRef(({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const activeValue = isControlled ? value : internalValue;

    const handleValueChange = (newValue) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
            <div
                ref={ref}
                className={cn("w-full", className)}
                {...props}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
});
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500",
            className
        )}
        {...props}
    />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef(({ className, value, children, activeValue, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const contextActiveValue = context?.value;
    const contextOnValueChange = context?.onValueChange;
    const isActive = value === (activeValue || contextActiveValue);
    const handleClick = () => {
        if (contextOnValueChange) {
            contextOnValueChange(value);
        } else if (onClick) {
            onClick(value);
        }
    };
    return (
        <button
            ref={ref}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={handleClick}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-gray-950 shadow-sm" : "hover:bg-gray-200/50 hover:text-gray-700",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef(({ className, value, activeValue, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const contextActiveValue = context?.value;
    const currentActiveValue = activeValue || contextActiveValue;
    if (value !== currentActiveValue) return null;
    return (
        <div
            ref={ref}
            role="tabpanel"
            className={cn(
                "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 animate-fade-in",
                className
            )}
            {...props}
        />
    );
});
TabsContent.displayName = "TabsContent";
