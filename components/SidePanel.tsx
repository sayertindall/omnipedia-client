import React from "react";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

import {
  RequirementEvaluation,
  EvaluationData,
  getSectionAggregateScore,
  getSentenceAggregateScore,
  getAllRequirementsForSection,
  getAllRequirementsForSentence,
  getAllRequirementsForArticle,
} from "@/lib/eval";
import _ from "lodash";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string | null;
  selectedType: "section" | "sentence" | "article" | null;
  evaluationData: EvaluationData | null; // Updated to use EvaluationData from lib/eval.ts
  sectionIndex?: number; // If a section is selected
  sentenceIndex?: number; // If a sentence is selected
}

export function SidePanel({
  isOpen,
  onClose,
  selectedText,
  selectedType,
  evaluationData,
  sectionIndex,
  sentenceIndex,
}: SidePanelProps) {
  if (!isOpen || !evaluationData) return null;

  // Based on the selected type, compute the aggregate scores
  let overallScore = 0;

  let relevantEvaluations: RequirementEvaluation[] = [];

  if (selectedType === "section" && sectionIndex !== undefined) {
    // Use getSectionAggregateScore to compute the aggregate score for the selected section
    overallScore = getSectionAggregateScore(evaluationData, sectionIndex) * 100;

    // Retrieve all requirements for the selected section
    relevantEvaluations = getAllRequirementsForSection(
      evaluationData,
      sectionIndex
    );
  } else if (
    selectedType === "sentence" &&
    sectionIndex !== undefined &&
    sentenceIndex !== undefined
  ) {
    // Use getSentenceAggregateScore to compute the aggregate score for the selected sentence
    overallScore =
      getSentenceAggregateScore(evaluationData, sectionIndex, sentenceIndex) *
      100;

    // Retrieve all requirements for the selected sentence
    relevantEvaluations = getAllRequirementsForSentence(
      evaluationData,
      sectionIndex,
      sentenceIndex
    );
  } else if (selectedType === "article") {
    // For the entire article, use the average scores across all sections
    const allArticleRequirements = getAllRequirementsForArticle(evaluationData);
    relevantEvaluations = allArticleRequirements;

    if (evaluationData.sections.length > 0) {
      const sectionScores = evaluationData.sections.map((section) =>
        getSectionAggregateScore(evaluationData, section.index)
      );
      const articleScore = _.mean(sectionScores);
      overallScore = (articleScore || 0) * 100;
    }
  }

  // Group evaluations by category
  const groupedEvaluations = _.groupBy(
    relevantEvaluations,
    "requirement_category"
  );

  // Utility function to determine text color based on score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  // Utility function to return a Badge component based on score range
  const getScoreBadge = (score: number) => {
    if (score >= 0.8)
      return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (score >= 0.5)
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold capitalize">
          {selectedType && selectedType !== "article"
            ? selectedType
            : "Article"}{" "}
          Analysis
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4 space-y-6">
          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={overallScore} className="w-full" />
                <p className="text-sm text-gray-600">
                  Based on {relevantEvaluations.length} requirements
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Selected Text Preview */}
          {selectedText && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactMarkdown className="text-sm text-gray-600">
                  {selectedText}
                </ReactMarkdown>
              </CardContent>
            </Card>
          )}

          {/* Requirements by Category */}
          {Object.entries(groupedEvaluations).map(([category, evaluations]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category}
                  <Badge>
                    {Array.isArray(evaluations) ? evaluations.length : 0}{" "}
                    {Array.isArray(evaluations) && evaluations.length === 1
                      ? "requirement"
                      : "requirements"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(evaluations) &&
                  evaluations.map((evaluation, index) => (
                    <Alert key={index} className="relative">
                      <AlertTitle className="flex items-center gap-2">
                        {evaluation.requirement_id}
                        {getScoreBadge(evaluation.score)}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Score</span>
                            <span className={getScoreColor(evaluation.score)}>
                              {(evaluation.score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Confidence
                            </span>
                            <span>
                              {(evaluation.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-medium">Evidence</p>
                            <p className="text-sm text-gray-600">
                              {evaluation.evidence}
                            </p>
                          </div>
                          {evaluation.overlap_notes && (
                            <div className="pt-2">
                              <p className="text-sm font-medium">
                                Overlap Notes
                              </p>
                              <p className="text-sm text-gray-600">
                                {evaluation.overlap_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default SidePanel;
