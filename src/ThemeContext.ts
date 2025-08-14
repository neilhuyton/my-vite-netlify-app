// src/ThemeContext.tsx
import { createContext, useContext } from "react";

export interface ThemeContextType {
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemeContext must be used within a ThemeContext.Provider"
    );
  }
  return context;
};
