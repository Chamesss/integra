import { ArrowRight } from "lucide-react";
import { WorkflowStep } from "../types";

interface Props {
  currentStep: WorkflowStep;
}

export default function VariationStepIndicator({ currentStep }: Props) {
  const steps = [
    { id: "attributes", label: "Attributs", number: 1 },
    { id: "preview", label: "Aperçu", number: 2 },
    { id: "confirm", label: "Confirmation", number: 3 },
  ];

  return (
    <div className="flex items-center justify-center gap-8 py-4 border-b">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {index > 0 && <ArrowRight className="w-4 h-4 text-gray-400 mr-4" />}
          <div
            className={`flex items-center space-x-2 ${
              currentStep === step.id ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step.id
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100"
              }`}
            >
              {step.number}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
