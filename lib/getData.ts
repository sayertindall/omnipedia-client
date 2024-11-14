import { join } from "path";
import { readFile } from "fs/promises";

export const getData = async () => {
  const article_path = join(process.cwd(), "public", "article.json");
  const eval_path = join(process.cwd(), "public", "evaluation.json");
  const req_path = join(process.cwd(), "public", "requirements.json");

  const article = JSON.parse(await readFile(article_path, "utf8"));
  const evaluation = JSON.parse(await readFile(eval_path, "utf8"));
  const requirements = JSON.parse(await readFile(req_path, "utf8"));

  return { article, evaluation, requirements };
};
