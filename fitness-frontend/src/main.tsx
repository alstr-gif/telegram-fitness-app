import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { TermsOfUse } from './pages/TermsOfUse'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { initializeAnalytics } from './utils/analytics'

// Initialize Analytics SDK BEFORE rendering
// This must complete before the app renders
const initApp = async () => {
  try {
    await initializeAnalytics();
    console.log('Analytics initialized, starting app...');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
    // Continue with app even if analytics fails
  }

  const rootElement = document.getElementById('root')!;
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
};

// Start the app
initApp();
