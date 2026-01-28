import { Check } from 'lucide-react';
import { STEPS } from '@/utils/constants';

export default function Stepper({ currentStep, completedSteps = [] }) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {STEPS.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <li
              key={step.name}
              className={`${stepIdx !== STEPS.length - 1 ? 'flex-1' : ''} relative`}
            >
              <div className="flex items-center">
                <div
                  className={`
                    relative flex h-10 w-10 items-center justify-center rounded-full
                    ${isCompleted
                      ? 'bg-primary-500'
                      : isCurrent
                        ? 'border-2 border-primary-500 bg-white'
                        : 'border-2 border-gray-300 bg-white'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-gray-900" />
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                {stepIdx !== STEPS.length - 1 && (
                  <div
                    className={`
                      ml-4 h-0.5 flex-1
                      ${isCompleted ? 'bg-primary-500' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
