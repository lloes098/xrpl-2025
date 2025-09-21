import { clsx } from "clsx";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            {/* Step Circle */}
            <div
              className={clsx(
                "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                currentStep > step.id
                  ? "bg-gradient-to-r from-cyan-400 to-purple-500 border-transparent neon-glow"
                  : currentStep === step.id
                  ? "border-cyan-400 glass neon-glow"
                  : "border-gray-600 glass"
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <span
                  className={clsx(
                    "text-lg font-semibold",
                    currentStep >= step.id ? "text-white" : "text-gray-400"
                  )}
                >
                  {step.id}
                </span>
              )}
            </div>
            
            {/* Step Info */}
            <div className="mt-3 text-center flex flex-col items-center">
              <h3
                className={clsx(
                  "text-sm font-semibold",
                  currentStep >= step.id ? "text-white" : "text-gray-400"
                )}
              >
                {step.title}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-1",
                  currentStep >= step.id ? "text-gray-300" : "text-gray-500"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={clsx(
                "flex-1 h-0.5 mx-4 mt-6 transition-all duration-300",
                currentStep > step.id
                  ? "bg-gradient-to-r from-cyan-400 to-purple-500"
                  : "bg-gray-600"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
