import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react'; // v5+ works with React 19
import { AppProvider } from './context/AppContext.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
      <AppProvider>
       <App />
      </AppProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);