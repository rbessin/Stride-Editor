"use client";

import { useTheme } from "./theme-provider";
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { IconButton } from './ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <IconButton 
      icon={theme === "light" ? MoonIcon : SunIcon}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="default"
      size="md"
    />
  );
}