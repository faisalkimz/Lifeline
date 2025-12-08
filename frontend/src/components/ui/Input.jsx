import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type = 'text', label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-1">
            {label && (
                <label className="text-sm font-medium leading-none text-gray-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-150 shadow-sm",
                    error && "border-error-500 focus:ring-error-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-xs text-error-500 font-medium mt-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
