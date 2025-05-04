import { useEffect, useState } from 'react';
import versionService from '@/services/VersionService';
import { AlertCircle, Download, X } from 'lucide-react';

interface VersionInfo {
  version: string;
  buildDate: string;
  notes: string;
  requiredUpdate: boolean;
  features: string[];
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Check for updates when component mounts
    const checkForUpdates = async () => {
      const result = await versionService.checkForUpdates();
      setUpdateAvailable(result.hasUpdate);
      setVersionInfo(result.versionInfo);
      
      // If it's a required update, don't allow dismissal
      if (result.versionInfo?.requiredUpdate) {
        setDismissed(false);
      }
    };
    
    checkForUpdates();
    
    // Set up periodic update checks (every 30 minutes)
    const intervalId = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleUpdate = () => {
    versionService.applyUpdate();
  };
  
  const handleDismiss = () => {
    // Only allow dismissal if it's not a required update
    if (versionInfo && !versionInfo.requiredUpdate) {
      setDismissed(true);
    }
  };
  
  // Don't show anything if no update or dismissed
  if (!updateAvailable || (dismissed && versionInfo && !versionInfo.requiredUpdate)) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Update Available
          </h3>
        </div>
        {!versionInfo?.requiredUpdate && (
          <button
            onClick={handleDismiss}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>Version {versionInfo?.version} is now available.</p>
        <p className="mt-1">{versionInfo?.notes}</p>
        
        {versionInfo?.features && versionInfo.features.length > 0 && (
          <div className="mt-2">
            <p className="font-medium">What's new:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {versionInfo.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <button
          onClick={handleUpdate}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          {versionInfo?.requiredUpdate ? 'Update Required' : 'Update Now'}
        </button>
      </div>
    </div>
  );
}
