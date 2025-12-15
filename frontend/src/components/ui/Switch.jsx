import React from 'react';
import { cn } from '../../utils/cn'; // Assuming you have a cn utility, or I'll implement it inline if needed.

// Simple Switch Component
const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        className={cn(
            "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-primary-600" : "bg-slate-200",
            className
        )}
        {...props}
    >
        <span
            data-state={checked ? 'checked' : 'unchecked'}
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                checked ? "translate-x-5" : "translate-x-0"
            )}
        />
    </button>
));
Switch.displayName = "Switch";

export { Switch };
