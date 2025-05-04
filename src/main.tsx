import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker for offline capabilities and background sync
serviceWorkerRegistration.register();

// Request notification permission
serviceWorkerRegistration.requestNotificationPermission();
