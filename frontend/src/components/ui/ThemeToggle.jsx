import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, toggleTheme } from '../../store/themeSlice';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  useEffect(() => {
    // Apply theme to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="w-9 h-9 p-0 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;

