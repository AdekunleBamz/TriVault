'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  clickable?: boolean;
  completedSteps?: number[];
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className,
  clickable = false,
  completedSteps = [],
}: StepperProps) {
  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(index) || index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <StepCircle
                  step={index + 1}
                  status={status}
                  icon={step.icon}
                  onClick={clickable ? () => onStepClick?.(index) : undefined}
                  clickable={clickable}
                />
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[40px]',
                      status === 'completed' ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </div>
              <div className={cn('pb-8', isLast && 'pb-0')}>
                <h3
                  className={cn(
                    'font-medium',
                    status === 'current'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <StepCircle
                step={index + 1}
                status={status}
                icon={step.icon}
                onClick={clickable ? () => onStepClick?.(index) : undefined}
                clickable={clickable}
              />
              <div className="mt-2 text-center">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    status === 'current'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.title}
                </h3>
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  status === 'completed' ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface StepCircleProps {
  step: number;
  status: 'completed' | 'current' | 'upcoming';
  icon?: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

function StepCircle({ step, status, icon, onClick, clickable }: StepCircleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        'text-sm font-medium transition-colors',
        status === 'completed' && 'bg-purple-600 text-white',
        status === 'current' && 'bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-900',
        status === 'upcoming' && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
        clickable && status !== 'upcoming' && 'cursor-pointer hover:opacity-80',
        !clickable && 'cursor-default'
      )}
    >
      {status === 'completed' ? (
        icon || (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )
      ) : (
        icon || step
      )}
    </button>
  );
}

// Progress steps (simple numbered steps)
interface ProgressStepsProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ totalSteps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-2 flex-1 rounded-full transition-colors',
            index < currentStep ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700',
            index === currentStep && 'bg-purple-400'
          )}
        />
      ))}
    </div>
  );
}

// Stepper with content
interface StepContent {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface StepperWithContentProps {
  steps: StepContent[];
  currentStep: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  className?: string;
  showNavigation?: boolean;
}

export function StepperWithContent({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onComplete,
  className,
  showNavigation = true,
}: StepperWithContentProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={cn('space-y-6', className)}>
      <ProgressSteps totalSteps={steps.length} currentStep={currentStep} />

      <div className="min-h-[200px]">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {steps[currentStep]?.title}
        </h2>
        {steps[currentStep]?.content}
      </div>

      {showNavigation && (
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstStep}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'border border-gray-300 dark:border-gray-600',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={isLastStep ? onComplete : onNext}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'bg-purple-600 text-white',
              'hover:bg-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLastStep ? 'Complete' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Stepper;
