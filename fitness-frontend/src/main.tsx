import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { TermsOfUse } from './pages/TermsOfUse'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { initializeAnalytics } from './utils/analytics'

// Initialize Analytics SDK
initializeAnalytics();

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
)
