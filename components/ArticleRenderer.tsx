import React from "react";

interface ArticleSection {
  title: string;
  content: string;
  sentences: string[];
}

interface ArticleRendererProps {
  onElementClick?: (
    text: string,
    type: "section" | "sentence",
    section: number,
    sentence?: number
  ) => void;
  highlightEnabled?: boolean;
  articleData?: ArticleSection[];
}

const stripMarkdown = (text: string): string => {
  // Remove bold/italic markers
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");

  // Remove links - extract just the text part
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove bullet points and replace with plain text
  text = text.replace(/^[\s]*[-*+][\s]+/gm, "• ");

  return text.trim();
};

const InteractiveText: React.FC<{
  text: string;
  type: "section" | "sentence";
  section: number;
  sentence?: number;
  className?: string;
  onElementClick: (
    text: string,
    type: "section" | "sentence",
    section: number,
    sentence?: number
  ) => void;
  highlightEnabled: boolean;
}> = ({
  text,
  type,
  section,
  sentence,
  className,
  onElementClick,
  highlightEnabled,
}) => (
  <span
    onClick={() => onElementClick(text, type, section, sentence)}
    className={`cursor-pointer ${className || ""} ${
      highlightEnabled ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""
    } font-medium text-gray-900 dark:text-gray-100`}
  >
    {stripMarkdown(text)}
    {type === "sentence" ? " " : ""}
  </span>
);

export const ArticleRenderer = ({
  onElementClick = () => {},
  highlightEnabled = true,
  articleData = [],
}: ArticleRendererProps) => {
  return (
    <div className="container p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900">
      {articleData.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-8">
          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            <InteractiveText
              text={section.title}
              type="section"
              section={sectionIndex}
              onElementClick={onElementClick}
              highlightEnabled={highlightEnabled}
            />
          </h1>

          {/* Pre-split sentences */}
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {section.sentences.map((sentence, index) => (
              <InteractiveText
                key={index}
                text={sentence}
                type="sentence"
                section={sectionIndex}
                sentence={index}
                className="inline"
                onElementClick={onElementClick}
                highlightEnabled={highlightEnabled}
              />
            ))}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ArticleRenderer;
