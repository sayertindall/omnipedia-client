import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const EvaluationViewer = ({
  evaluationData,
  selectedSection,
  selectedSentence,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [aggregateScore, setAggregateScore] = useState(0);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    if (!evaluationData) return;

    // Calculate scores based on selection type
    const score = selectedSentence
      ? getSentenceAggregateScore(
          evaluationData,
          selectedSection,
          selectedSentence
        )
      : selectedSection
      ? getSectionAggregateScore(evaluationData, selectedSection)
      : getOverallArticleScore(evaluationData);

    setAggregateScore(score);

    // Get requirements based on selection type
    const reqs = selectedSentence
      ? getAllRequirementsForSentence(
          evaluationData,
          selectedSection,
          selectedSentence
        )
      : selectedSection
      ? getAllRequirementsForSection(evaluationData, selectedSection)
      : getAllRequirementsForArticle(evaluationData);

    setRequirements(reqs);
  }, [evaluationData, selectedSection, selectedSentence]);

  const getScoreColor = (score) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const renderScoreBadge = (score) => (
    <Badge className={`${getScoreColor(score)} text-lg font-bold`}>
      {Math.round(score * 100)}%
    </Badge>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Overall Score</h3>
              {renderScoreBadge(aggregateScore)}
            </div>

            <ScrollArea className="h-[400px]">
              {requirements.map((req, idx) => (
                <div key={idx} className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{req.requirement_id}</span>
                    {renderScoreBadge(req.score)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {req.reasoning}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {requirements.map((req, idx) => (
                <Card key={idx} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{req.requirement_id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {req.requirement_category} • {req.classification}
                        </p>
                      </div>
                      {renderScoreBadge(req.score)}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-1 shrink-0" />
                        <p className="text-sm">{req.evidence}</p>
                      </div>

                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-1 shrink-0" />
                        <p className="text-sm">{req.reasoning}</p>
                      </div>

                      {req.overlap_notes && (
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 mt-1 shrink-0" />
                          <p className="text-sm">{req.overlap_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(requirements, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EvaluationViewer;
