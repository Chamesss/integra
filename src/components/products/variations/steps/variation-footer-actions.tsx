import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { WorkflowStep } from "../types";

interface Props {
  currentStep: WorkflowStep;
  hasSelectedAttributes: boolean;
  hasValidTerms: boolean;
  enabledVariationsCount: number;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function VariationFooterActions({
  currentStep,
  hasSelectedAttributes,
  hasValidTerms,
  enabledVariationsCount,
  isLoading,
  onBack,
  onNext,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex space-x-2">
        {currentStep !== "attributes" && (
          <Button variant="outline" onClick={onBack}>
            Retour
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>

        {currentStep === "attributes" && (
          <Button
            onClick={onNext}
            disabled={!hasSelectedAttributes || !hasValidTerms}
          >
            Générer les variations
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {currentStep === "preview" && (
          <Button onClick={onNext} disabled={enabledVariationsCount === 0}>
            Confirmer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {currentStep === "confirm" && (
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              "Création..."
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Créer les variations
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
