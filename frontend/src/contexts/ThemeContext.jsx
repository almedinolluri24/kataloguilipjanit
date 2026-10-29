import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextStore';

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('katalogu-lipjan-theme') || 'system');
  const [systemTheme, setSystemTheme] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const theme = mode === 'system' ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const update = (event) => setSystemTheme(event.matches ? 'light' : 'dark');
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('katalogu-lipjan-theme', next);
    setMode(next);
  };

  return <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>{children}</ThemeContext.Provider>;
};
