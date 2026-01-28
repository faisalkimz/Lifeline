import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const Input = React.forwardRef(({ className, type = 'text', label, error, variant = "default", required, hint, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = error ? `${inputId}-error` : undefined;

    return (
        <div className="w-full space-y-1.5 group">
            {label && (
                <div className="flex justify-between items-center px-1">
                    <label
                        htmlFor={inputId}
                        className="text-xs font-bold uppercase tracking-wider text-gray-500 group-focus-within:text-primary-600 transition-colors"
                    >
                        {label}
                        {required && <span className="text-error-500 ml-1" aria-label="required">*</span>}
                    </label>
                    {hint && <span className="text-[10px] font-medium text-gray-400 capitalize">{hint}</span>}
                </div>
            )}
            <input
                id={inputId}
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm",
                    {
                        "border-gray-200 focus:ring-primary-500/10 focus:border-primary-500": variant === "default" && !error,
                        "border-error-500 focus:ring-error-500/10 focus:border-error-500": error,
                        "border-success-500 focus:ring-success-500/10 focus:border-success-500": variant === "success",
                        "border-warning-500 focus:ring-warning-500/10 focus:border-warning-500": variant === "warning",
                    },
                    className
                )}
                ref={ref}
                required={required}
                aria-invalid={!!error}
                aria-describedby={errorId}
                {...props}
            />
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id={errorId}
                    className="text-[11px] text-error-600 font-bold px-1 flex items-center gap-1.5"
                    role="alert"
                    aria-live="polite"
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </motion.p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
