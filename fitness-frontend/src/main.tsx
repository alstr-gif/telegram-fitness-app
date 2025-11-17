import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Get telegramId from URL params or localStorage for initial render
const getInitialTelegramId = () => {
  // Try to get from localStorage first (set after auth)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('telegramId');
    if (stored) return stored;
    
    // Fallback for browser testing
    return '999999999';
  }
  return '999999999';
};

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
