import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ checked, onCheckedChange, id, className = "" }) => {
    const handleChange = (e) => {
        if (onCheckedChange) {
            onCheckedChange(e.target.checked);
        }
    };

    return (
        <div className="relative">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={handleChange}
                className="sr-only"
            />
            <label
                htmlFor={id}
                className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded cursor-pointer transition-colors ${
                    checked
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${className}`}
            >
                {checked && (
                    <Check className="w-3 h-3 text-white" />
                )}
            </label>
        </div>
    );
};

export { Checkbox };





