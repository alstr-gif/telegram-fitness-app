import React, { createContext, useContext, ReactNode } from 'react';
import { ColorScheme, getColorScheme } from '../utils/colors';

interface ColorContextType {
  colorScheme: ColorScheme;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

interface ColorProviderProps {
  children: ReactNode;
}

export function ColorProvider({ children }: ColorProviderProps) {
  const colorScheme = getColorScheme();

  return (
    <ColorContext.Provider value={{ colorScheme }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}

