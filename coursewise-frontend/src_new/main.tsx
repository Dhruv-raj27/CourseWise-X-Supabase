import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import React from 'react';

// Create a script element for injecting the Vercel Web Analytics script directly
// This helps resolve 404 errors when the CDN path changes or has issues
const injectVercelScripts = () => {
  // For Vercel Analytics
  const analyticsScript = document.createElement('script');
  analyticsScript.src = '/_vercel/insights/script.js';
  analyticsScript.defer = true;
  
  // For Vercel Speed Insights
  const speedInsightsScript = document.createElement('script');
  speedInsightsScript.src = '/_vercel/speed-insights/script.js';
  speedInsightsScript.defer = true;
  
  // Only add in production mode
  if (import.meta.env.PROD) {
    document.head.appendChild(analyticsScript);
    document.head.appendChild(speedInsightsScript);
  }
};

// Inject the scripts
injectVercelScripts();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Use the React components as fallback */}
    <Analytics />
    <SpeedInsights />
  </StrictMode>
);
