import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string; }>;
  prompt(): Promise<void>;
}

const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Add state for debugging
  const [installDebugInfo, setInstallDebugInfo] = useState('');

  useEffect(() => {
    // Check if the app is already installed (running in standalone mode)
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullScreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // iOS detection
      const isIOSInstalled = window.navigator.standalone === true;
      
      const installed = isStandalone || isFullScreen || isMinimalUi || isIOSInstalled;
      setIsAppInstalled(installed);
      
      // Update debug info
      setInstallDebugInfo(prev => prev + `
App installed check: ${installed}`);
    };
    
    // Check initially
    checkIfInstalled();
    
    // Also listen for display mode changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => checkIfInstalled();
    
    // Use the right event listener based on browser support
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleDisplayModeChange);
    } else if (mediaQueryList.addListener) {
      // For older browsers
      mediaQueryList.addListener(handleDisplayModeChange);
    }
    
    // Log when the component mounts
    console.log('AppLayout mounted, waiting for beforeinstallprompt event');
    setInstallDebugInfo('Waiting for beforeinstallprompt event...');
    
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log("'beforeinstallprompt' event fired and stored.");
      setInstallDebugInfo(prev => prev + `
beforeinstallprompt event captured!`);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Also listen for appinstalled event
    const installedHandler = () => {
      console.log('App was installed');
      setInstallDebugInfo(prev => prev + `
App was installed!`);
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      
      // Clean up display mode listener
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleDisplayModeChange);
      } else if (mediaQueryList.removeListener) {
        mediaQueryList.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("Install prompt not available");
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, clear it
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header canInstall={!!deferredPrompt && !isAppInstalled} onInstallClick={handleInstallClick} />
      <div className="flex min-h-[calc(100vh-64px)]">
        {!isMobile && <Sidebar />}
        <main className="flex-grow pt-2 pb-20 px-4 md:pb-8 md:px-8">
          <Outlet />
          
          {/* Debug information - only visible in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-20 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-xs z-50 overflow-auto max-h-40">
              <h4 className="font-bold mb-1">PWA Install Debug:</h4>
              <pre>{installDebugInfo || 'No debug info yet'}</pre>
              <div className="mt-2">
                <p>Can Install: {!!deferredPrompt && !isAppInstalled ? 'Yes' : 'No'}</p>
                <p>Is Installed: {isAppInstalled ? 'Yes' : 'No'}</p>
                <p>Has Prompt: {!!deferredPrompt ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
};

export default AppLayout;
