import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, variant = "default", role, ...props }, ref) => (
    <div
        ref={ref}
        role={role}
        className={cn(
            "rounded-xl border bg-background-primary text-text-primary shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2",
            {
                "border-border-light": variant === "default",
                "border-primary-200 bg-primary-50/50": variant === "primary",
                "border-success-200 bg-success-50/50": variant === "success",
                "border-warning-200 bg-warning-50/50": variant === "warning",
                "border-error-200 bg-error-50/50": variant === "error",
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
            "text-xl font-semibold leading-tight tracking-tight text-text-primary",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-text-secondary leading-relaxed", className)}
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
        className={cn("flex items-center justify-end gap-3 p-6 pt-4 border-t border-border-light", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
