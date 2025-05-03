import React, { useEffect, useState } from 'react';
import { getNetworkStatus, getOfflineQueue } from '../../services/dbService';
import { AlertCircle, WifiOff } from 'lucide-react';

const OfflineNotice: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  
  useEffect(() => {
    // Check initial network status and queue size
    const checkStatus = async () => {
      const online = await getNetworkStatus();
      setIsOffline(!online);
      
      const queue = await getOfflineQueue();
      setQueueSize(queue.length);
    };
    
    checkStatus();
    
    // Set up interval to check queue size periodically
    const intervalId = setInterval(async () => {
      const queue = await getOfflineQueue();
      setQueueSize(queue.length);
    }, 10000); // Check every 10 seconds
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      checkStatus(); // Re-check queue when coming online
    };
    
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Custom event for queue changes
    const handleQueueChange = () => checkStatus();
    window.addEventListener('offlineQueueChanged', handleQueueChange);
    
    // Clean up event listeners and interval
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineQueueChanged', handleQueueChange);
    };
  }, []);
  
  // Don't render anything if online
  if (!isOffline) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-2 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-yellow-800">
          <WifiOff size={18} />
          <span className="text-sm font-medium">
            You're offline. Changes will sync when you reconnect.
          </span>
        </div>
        {queueSize > 0 && (
          <div className="flex items-center space-x-1 text-yellow-700 text-xs">
            <AlertCircle size={14} />
            <span>{queueSize} pending {queueSize === 1 ? 'change' : 'changes'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineNotice;
