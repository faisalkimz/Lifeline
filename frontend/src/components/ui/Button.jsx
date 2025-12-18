import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-md",
                secondary: "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 focus-visible:ring-primary-500 shadow-sm",
                success: "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500 shadow-sm hover:shadow-md",
                warning: "bg-warning-600 text-white hover:bg-warning-700 focus-visible:ring-warning-500 shadow-sm hover:shadow-md",
                destructive: "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 shadow-sm hover:shadow-md",
                ghost: "bg-transparent hover:bg-neutral-100 hover:text-neutral-900 text-neutral-600",
                outline: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
                link: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto",
            },
            size: {
                sm: "h-8 px-3 text-xs rounded-md",
                md: "h-10 px-4 text-sm rounded-lg",
                lg: "h-12 px-6 text-base rounded-lg",
                xl: "h-14 px-8 text-lg rounded-xl",
                icon: "h-10 w-10 rounded-lg",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            fullWidth: false,
        },
    }
);

const Button = React.forwardRef(({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, fullWidth, className }))}
            ref={ref}
            disabled={isLoading}
            aria-disabled={isLoading}
            aria-busy={isLoading}
            {...props}
        >
            {isLoading && (
                <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
