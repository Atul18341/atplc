import { createContext, useContext, useEffect, useState } from 'react';

// Create context with default values
export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
    setDarkTheme: () => { },
    setLightTheme: () => { }
});

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme());

    function getInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme !== null) {
            // Validate the saved theme
            return savedTheme === 'dark' ? 'dark' : 'light';
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
    }

    const setDarkTheme = () => {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
    };

    const setLightTheme = () => {
        setTheme('light');
        localStorage.setItem('theme', 'light');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            if (localStorage.getItem('theme') === null) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme class to body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.remove('light');
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        }
    }, [theme]);

    const value = {
        theme,
        toggleTheme,
        setDarkTheme,
        setLightTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook for using theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};