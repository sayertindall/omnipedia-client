export const getData = async () => {
  const articleResponse = await fetch("/article.json");
  const evaluationResponse = await fetch("/evaluation.json");
  const requirementsResponse = await fetch("/requirements.json");

  const article = await articleResponse.json();
  const evaluation = await evaluationResponse.json();
  const requirements = await requirementsResponse.json();

  return { article, evaluation, requirements };
};
