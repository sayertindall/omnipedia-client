import articleData from "./data/article.json";
import evaluationData from "./data/evaluation.json";
import requirementsData from "./data/requirements.json";

export const getData = () => {
  return {
    article: articleData,
    evaluation: evaluationData,
    requirements: requirementsData,
  };
};
