import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Evaluation, RequirementsDocument } from "@/types";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string | null;
  selectedType: "section" | "sentence" | null;
  evaluationData: Evaluation;
  requirementsData: RequirementsDocument;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  selectedText,
  selectedType,
  evaluationData,
  requirementsData,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const getEvaluationData = () => {
    if (!selectedText || !selectedType) return null;

    if (selectedType === "section") {
      return evaluationData.sections.find((s) => s.title === selectedText);
    }

    return evaluationData.sections
      .flatMap((s) => s.sentence_evaluations)
      .find((se) => se.sentence === selectedText);
  };

  const evaluationDetails = getEvaluationData();

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 bg-background border-l shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Evaluation Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4 space-y-4">
          {evaluationDetails ? (
            <>
              <Card className="p-4">
                <h3 className="font-medium mb-2">Selected {selectedType}</h3>
                <p className="text-sm text-muted-foreground">{selectedText}</p>
              </Card>

              {evaluationDetails.requirement_evaluations.map(
                (detail, index) => {
                  const requirement = requirementsData.groups
                    .flatMap((g) => g.requirements)
                    .find((r) => r.id === detail.requirement_id);

                  return (
                    <Card key={index} className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          {requirement?.description}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Score: {detail.score}</div>
                          <div>Confidence: {detail.confidence}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {detail.reasoning}
                        </p>
                      </div>
                    </Card>
                  );
                }
              )}

              {evaluationDetails.meta_notes && (
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {evaluationDetails.meta_notes}
                  </p>
                </Card>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              No evaluation data available
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
