
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="max-w-3xl px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-finance-blue">
          <span className="text-finance-yellow">Un</span>clutter Finance
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Simplify your financial life with our intuitive personal finance management app.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Button 
            className="bg-finance-yellow text-finance-blue hover:bg-finance-yellow/90 px-8 py-6 text-lg"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            className="border-finance-blue text-finance-blue hover:bg-finance-blue/5 px-8 py-6 text-lg"
            onClick={() => navigate('/register')}
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
