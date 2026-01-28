import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, variant = "default", role, ...props }, ref) => (
    <div
        ref={ref}
        role={role}
        className={cn(
            "rounded-xl border bg-white text-gray-900 shadow-sm transition-shadow duration-200",
            {
                "border-gray-200": variant === "default",
                "border-primary-200 bg-primary-50": variant === "primary",
                "border-green-200 bg-green-50": variant === "success",
                "border-amber-200 bg-amber-50": variant === "warning",
                "border-red-200 bg-red-50": variant === "error",
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
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-tight text-gray-900",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-500 leading-relaxed", className)}
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
        className={cn("flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
