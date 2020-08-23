import { SphinxForm, SphinxQuestion } from "./types.ts";
export const FORM_HEADER_BYTES_LENGTH = 20 * 16;
export const RECORD_HEADER_BYTES_LENGTH = 16;

export const questionBytesLength = (question: SphinxQuestion) => {
  // TODO check
  if (question.type === "number") return 4;
  if (question.type === "open") return 10;
  if (question.type === "date") return 8;
  if (question.type === "options") return 1;
  if (question.type === "multipleOptions") return question.maxResponses * 10; // TODO TBC
  if (question.type === "code") return question.nbCharCode;
  return 0;
};

export const recordBytesLength = (form: SphinxForm) => {
  return form.questions.reduce<number>(
    (prev, curr) => (prev += questionBytesLength(curr), prev),
    RECORD_HEADER_BYTES_LENGTH,
  );
};
