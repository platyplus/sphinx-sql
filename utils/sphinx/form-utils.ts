import {
  SphinxForm,
  SphinxQuestion,
  SphinxMultipleOptionsQuestion,
  SphinxCodeQuestion,
} from "./types.ts";
export const FORM_HEADER_BYTES_LENGTH = 20 * 16;
export const RECORD_HEADER_BYTES_LENGTH = 16;

// TODO check
export const questionBytesLength = (question: SphinxQuestion) => ({
  "number": () => 4,
  "open": () => 10,
  "date": () => 8,
  "options": () => 1,
  "multipleOptions": () =>
    (question as SphinxMultipleOptionsQuestion).maxResponses * 10,
  "code": () => (question as SphinxCodeQuestion).nbCharCode,
}[question.type]());

export const recordBytesLength = (form: SphinxForm) => {
  return form.questions.reduce<number>(
    (prev, curr) => (prev += questionBytesLength(curr), prev),
    RECORD_HEADER_BYTES_LENGTH,
  );
};
