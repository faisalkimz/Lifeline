import React from 'react';

const Badge = ({ children, variant = "default", className = "", size = "sm" }) => {
    const variants = {
        default: "bg-neutral-100 text-neutral-800 border-neutral-200",
        primary: "bg-primary-100 text-primary-800 border-primary-200",
        secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
        success: "bg-success-100 text-success-800 border-success-200",
        warning: "bg-warning-100 text-warning-800 border-warning-200",
        error: "bg-error-100 text-error-800 border-error-200",
        info: "bg-primary-100 text-primary-800 border-primary-200",
        outline: "border border-neutral-300 text-neutral-700 bg-transparent",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium border transition-colors duration-150 ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export { Badge };












