'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StepProgress } from '@/components/ui/Progress';

interface OnboardingStep {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps: OnboardingStep[] = [
    {
      title: 'Welcome to TriVault',
      description: 'Your journey to collect rare seals begins here',
      content: (
        <div className="text-center py-8">
          <div className="text-6xl mb-6">🦭</div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome, Collector!</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            TriVault is a mini-app where you can collect unique seals from three
            mystical vaults. Each seal represents your participation in the
            Farcaster ecosystem.
          </p>
        </div>
      ),
    },
    {
      title: 'The Three Vaults',
      description: 'Each vault holds a unique seal',
      content: (
        <div className="py-8">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-red-500/10 rounded-xl">
              <span className="text-4xl">🔴</span>
              <h3 className="font-medium text-white mt-2">Ruby</h3>
              <p className="text-xs text-gray-400">Courage</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-xl">
              <span className="text-4xl">🟢</span>
              <h3 className="font-medium text-white mt-2">Emerald</h3>
              <p className="text-xs text-gray-400">Wisdom</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-xl">
              <span className="text-4xl">🔵</span>
              <h3 className="font-medium text-white mt-2">Sapphire</h3>
              <p className="text-xs text-gray-400">Serenity</p>
            </div>
          </div>
          <p className="text-gray-400 text-center">
            Collect seals from all three vaults to complete your collection!
          </p>
        </div>
      ),
    },
    {
      title: 'How to Collect',
      description: 'Simple steps to get started',
      content: (
        <div className="py-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-white">Connect Wallet</h4>
              <p className="text-sm text-gray-400">Use your connected wallet to interact</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-white">Choose a Vault</h4>
              <p className="text-sm text-gray-400">Select Ruby, Emerald, or Sapphire</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-white">Collect Seal</h4>
              <p className="text-sm text-gray-400">Pay a small fee (0.00001 ETH) to collect</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ready to Start!',
      description: 'Your collection awaits',
      content: (
        <div className="text-center py-8">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">You&apos;re All Set!</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            You&apos;re ready to start collecting seals. Unlock achievements, climb
            the leaderboard, and share your progress with friends!
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <StepProgress
            currentStep={currentStep}
            totalSteps={steps.length}
            className="mb-4"
          />
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <p className="text-gray-400 text-sm">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {steps[currentStep].content}

          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button variant="primary" onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
