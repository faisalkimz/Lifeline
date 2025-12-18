import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type = 'text', label, error, variant = "default", required, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = error ? `${inputId}-error` : undefined;

    return (
        <div className="w-full space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium leading-none text-text-primary"
                >
                    {label}
                    {required && <span className="text-error-500 ml-1" aria-label="required">*</span>}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border bg-background-primary px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
                    {
                        "border-border-medium focus:ring-primary-500 focus:border-primary-500 hover:border-border-dark": variant === "default" && !error,
                        "border-error-500 focus:ring-error-500 focus:border-error-500": error,
                        "border-success-500 focus:ring-success-500 focus:border-success-500": variant === "success",
                        "border-warning-500 focus:ring-warning-500 focus:border-warning-500": variant === "warning",
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
                <p
                    id={errorId}
                    className="text-xs text-error-600 font-medium flex items-center gap-1"
                    role="alert"
                    aria-live="polite"
                >
                    <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                    >
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
