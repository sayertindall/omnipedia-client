import { cn } from "@/lib/utils";
import { Evaluation } from "@/types";

interface InteractiveElementProps {
  text: string;
  type: "section" | "sentence";
  onClick: (text: string, type: "section" | "sentence") => void;
  highlightEnabled: boolean;
  evaluationData: Evaluation;
  className?: string;
}

export const InteractiveElement: React.FC<InteractiveElementProps> = ({
  text,
  type,
  onClick,
  highlightEnabled,
  evaluationData,
  className,
}) => {
  const getHighlightClass = () => {
    if (!highlightEnabled) return "";

    const evaluation =
      type === "section"
        ? evaluationData.sections.find((s) => s.title === text)
            ?.requirement_evaluations
        : evaluationData.sections
            .flatMap((s) => s.sentence_evaluations)
            .find((se) => se.sentence === text)?.requirement_evaluations;

    if (!evaluation) return "";

    const avgScore =
      evaluation.reduce((acc, curr) => acc + curr.score, 0) / evaluation.length;

    if (avgScore >= 0.7) return "bg-red-200 dark:bg-red-900";
    if (avgScore >= 0.4) return "bg-yellow-200 dark:bg-yellow-900";
    return "";
  };

  return (
    <span
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted",
        getHighlightClass(),
        className
      )}
      onClick={() => onClick(text, type)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(text, type);
        }
      }}
      aria-label={`View evaluations for ${text}`}
    >
      {text}
    </span>
  );
};
