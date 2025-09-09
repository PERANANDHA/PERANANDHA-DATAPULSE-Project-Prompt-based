
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WrappedApp from './WrappedApp';
import { Toaster } from './components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WrappedApp />
    <Toaster />
  </React.StrictMode>
);
