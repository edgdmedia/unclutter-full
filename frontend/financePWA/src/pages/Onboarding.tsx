import React from 'react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    title: 'Welcome to Unclutter Finance',
    description: 'Take control of your finances, set goals, and track your progress all in one place.',
  },
  {
    title: 'Track Your Spending',
    description: 'Easily log transactions, categorize expenses, and visualize your financial habits.',
  },
  {
    title: 'Set & Achieve Goals',
    description: 'Create savings goals and monitor your journey toward financial freedom.',
  },
  {
    title: 'Get Started!',
    description: 'Sign up or log in to begin your uncluttered financial journey.',
  },
];

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = React.useState(0);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('hasVisited', 'true');
      onFinish();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-finance-blue text-white p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">{slides[step].title}</h1>
        <p className="mb-8 text-lg">{slides[step].description}</p>
        <Button onClick={handleNext} className="bg-finance-yellow text-finance-blue w-full">
          {step < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`inline-block w-3 h-3 rounded-full ${idx === step ? 'bg-finance-yellow' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
