import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600",
                secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus-visible:ring-gray-200",
                destructive: "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-600",
                ghost: "bg-transparent hover:bg-gray-100 hover:text-gray-900 text-gray-600",
                link: "text-primary-600 underline-offset-4 hover:underline",
            },
            size: {
                sm: "h-9 px-3 text-xs",
                md: "h-10 px-4 py-2 text-sm",
                lg: "h-11 px-8 text-base",
                icon: "h-10 w-10",
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
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
