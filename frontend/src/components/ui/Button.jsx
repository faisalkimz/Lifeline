import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm",
                secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-primary-500 shadow-sm",
                success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm",
                warning: "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 shadow-sm",
                destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
                ghost: "bg-transparent hover:bg-gray-100 hover:text-gray-900 text-gray-600",
                outline: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
                link: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto",
            },
            size: {
                sm: "h-8 px-3 text-xs rounded-md",
                md: "h-10 px-4 text-sm rounded-lg",
                lg: "h-11 px-5 text-base rounded-lg",
                xl: "h-12 px-6 text-base rounded-lg",
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
