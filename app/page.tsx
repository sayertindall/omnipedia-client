"use client";

import { useEffect, useState } from "react";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { SidePanel } from "@/components/SidePanel";
import { HighlightToggle } from "@/components/HighlightToggle";
import useSWR from "swr";

export default function Page() {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "section" | "sentence" | null
  >(null);
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR("/api/data", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    console.log("DATA: ", data);
  }, [data]);

  const handleElementClick = (
    text: string,
    type: "section" | "sentence",
    sectionIdx: number,
    sentenceIdx?: number
  ) => {
    // if type == section, idx == section idx
    // if type == sentence, idx == section idx + sentence idx
    // setSelectedText(text);
    // setSelectedType(type);
    // setSidePanelOpen(true);
    if (type === "section") {
      console.log("Section clicked:", data.article[sectionIdx].content);
      // Set the evaluation data for the section
      const sectionEvaluation = data.evaluation.sections.find(
        (section) => section.index === sectionIdx + 1
      );
      console.log("Section Evaluation:", sectionEvaluation);
    } else if (type === "sentence" && sentenceIdx !== undefined) {
      console.log(
        "Sentence clicked:",
        data.article[sectionIdx].sentences[sentenceIdx]
      );
      // Set the evaluation data for the sentence
      const sectionEvaluation = data.evaluation.sections.find(
        (section) => section.index === sectionIdx + 1
      );
      const sentenceEvaluation = sectionEvaluation?.sentence_evaluations.find(
        (sentence) => sentence.index === sentenceIdx + 1
      );
      console.log("Sentence Evaluation:", sentenceEvaluation);
    }
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
        onElementClick={handleElementClick}
        highlightEnabled={highlightEnabled}
      />

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        selectedText={selectedText}
        selectedType={selectedType}
        evaluationData={data.evaluation}
        requirementsData={data.requirements}
      />
    </div>
  );
}
