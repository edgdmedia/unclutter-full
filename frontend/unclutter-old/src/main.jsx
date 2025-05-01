import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { storageService } from './services/storage';

// Initialize offline storage
storageService.initNetworkMonitoring();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)