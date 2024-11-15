"use client";

import { useState } from "react";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { SidePanel } from "@/components/SidePanel";
import { HighlightToggle } from "@/components/HighlightToggle";
import useSWR from "swr";
import { EvaluationData } from "@/lib/eval";

export default function Page() {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "section" | "sentence" | "article" | null
  >(null);
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<{
    type: "section" | "sentence" | "article" | null;
    data: EvaluationData | null;
    sectionIndex?: number;
    sentenceIndex?: number;
  }>({ type: null, data: null });

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR("/api/data", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleElementClick = (
    text: string,
    type: "section" | "sentence",
    sectionIdx: number,
    sentenceIdx?: number
  ) => {
    console.log("type: ", type);
    console.log("sectionIdx: ", sectionIdx);
    console.log("sentenceIdx: ", sentenceIdx);

    if (!data || !data.evaluation) return;

    // Adjusting indices to match one-based indexing used in evaluation data
    const sectionDataIndex = sectionIdx + 1;
    const sentenceDataIndex =
      sentenceIdx !== undefined ? sentenceIdx + 1 : undefined;

    setSelectedText(text);
    setSelectedType(type);
    setSidePanelOpen(true);

    setSelectedEvaluation({
      type,
      data: data.evaluation, // Pass the full EvaluationData
      sectionIndex: sectionDataIndex,
      sentenceIndex: sentenceDataIndex,
    });
  };

  if (error) return <div>Error loading data</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <HighlightToggle
          enabled={highlightEnabled}
          onToggle={() => setHighlightEnabled(!highlightEnabled)}
        />
      </div>

      <ArticleRenderer
        articleData={data.article}
        evaluationData={data.evaluation}
        onElementClick={handleElementClick}
        highlightEnabled={highlightEnabled}
      />

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        selectedText={selectedText}
        selectedType={selectedType}
        evaluationData={selectedEvaluation.data}
        sectionIndex={selectedEvaluation.sectionIndex}
        sentenceIndex={selectedEvaluation.sentenceIndex}
      />
    </div>
  );
}
