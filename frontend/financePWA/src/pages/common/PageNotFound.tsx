
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center flex-col px-4">
      <h1 className="text-7xl font-bold text-finance-yellow mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="space-x-4">
        <Button 
          variant="default" 
          className="bg-finance-yellow text-finance-blue hover:bg-finance-yellow/90"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PageNotFound;
