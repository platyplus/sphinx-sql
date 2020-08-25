import { SphinxConfig, SphinxForm, SphinxQuestion } from "./types.ts";
import { loadConfig } from "./load-config.ts";

// * Get only the questions that are meant to be columns
// TODO skip grouped / flatenned columns e.g. patient name etc
// TODO options questions will become a foreign key (unless option type is number or boolean or? e.g. yes-no/true-false)
const columnQuestions = ({ questions }: SphinxForm) =>
  questions.filter((question) => question.type !== "multipleOptions");

const columnQuestionToSql = (question: SphinxQuestion) => {
  //   const type = question.type;
  let columnType: string = "";
  switch (question.type) {
    case "code":
      columnType = `VARCHAR (${question.nbCharCode})`;
      break;
    case "number":
      columnType = "INT"; // TODO different number types
      break;
    case "open":
      // ? What are the implications about CI text ?
      //   const length = question.nbCharLines * question.nbLines;
      //   columnType = length ? `VARCHAR (${length})` : "public.citext";
      columnType = "public.citext";
      break;
    case "date":
      columnType = "TIMESTAMPZ";
      break;
    case "options":
      columnType = "TEXT"; // TODO depends on the options type in options.yaml
      break;
  }
  return `${question.variable} ${columnType}`;
};

const formToSql = (name: string, form: SphinxForm) => {
  // user_id serial PRIMARY KEY
  const columns = ["id UUID DEFAULT public.gen_random_uuid() PRIMARY KEY"];
  columns.push(
    ...columnQuestions(form).map((question) => columnQuestionToSql(question)),
  );
  const strColumns = columns.map((c) => `\t${c}`).join(",\t\n");
  // TODO updated at, created at, id, multipleOptions questions, other manyToMany...
  return `CREATE TABLE IF NOT EXISTS ${name} (\n${strColumns}\n);`;
};

export const generateSqlSchema = async (config: SphinxConfig | string) => {
  if (typeof config === "string") config = await loadConfig(config);
  // TODO dics and options sets, intermediate columns, 'flattened' tables...
  const tables: string[] = [];
  for (const name in config.forms) {
    const form = config.forms[name];
    tables.push(formToSql(name, form));
  }
  return tables.join("\n");
};
