import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, variant = "default", role, ...props }, ref) => (
    <div
        ref={ref}
        role={role}
        className={cn(
            "rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm transition-shadow duration-200 hover:shadow-md",
            {
                "border-slate-200 dark:border-slate-800": variant === "default",
                "border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10": variant === "primary",
                "border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/10": variant === "success",
                "border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-900/10": variant === "warning",
                "border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-900/10": variant === "error",
            },
            className
        )}
        {...props}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-100 dark:border-slate-800/60", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
