import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
                relative inline-flex items-center justify-center
                w-12 h-12 rounded-xl
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                shadow-sm hover:shadow-md
                transition-all duration-300
                group cursor-pointer
                ${className}
            `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun Icon (Light Mode) */}
      <Sun className={`
                absolute h-5 w-5 text-amber-500
                transition-all duration-300
                ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
            `} />

      {/* Moon Icon (Dark Mode) */}
      <Moon className={`
                absolute h-5 w-5 text-indigo-400
                transition-all duration-300
                ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
            `} />

      {/* Animated glow effect */}
      <div className={`
                absolute inset-0 rounded-xl
                transition-opacity duration-300
                ${isDark
          ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20'
          : 'bg-amber-500/10 group-hover:bg-amber-500/20'
        }
            `} />
    </button>
  );
};

export default ThemeToggle;


