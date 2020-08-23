import { readStringDelim } from "https://deno.land/std/io/mod.ts";
import { SphinxForm, SphinxQuestion, SphinxOptionsSet } from "./types.ts";
import {
  recordBytesLength,
  FORM_HEADER_BYTES_LENGTH,
  RECORD_HEADER_BYTES_LENGTH,
  questionBytesLength,
} from "./form-utils.ts";
import { loadSphinxForm } from "./load-form.ts";
import {
  getOptionSet,
  getOptionValue,
} from "./options-set.ts";
import { readYamlFile } from "../yaml.ts";

const closedQuestionValue = (
  question: SphinxQuestion,
  rawValue: Uint8Array,
  optionsSet?: SphinxOptionsSet,
) => {
  if (question.type === "code") {
    return new TextDecoder("ascii").decode(rawValue).replace(/\0/g, "") ||
      undefined;
  }
  const dataView = new DataView(rawValue.buffer, 0, rawValue.length);
  if (question.type === "number") {
    if (question.numberType == 2) {
      return dataView.getInt8(0);
    } else {
      console.warn(
        `Get value from number type ${question.numberType} is not implemented`,
      );
    }
  }
  if (question.type === "open") return;
  if (question.type === "date") {
    // TODO
    // console.log(dataView, new Date(dataView.getInt32(4)));
    return undefined;
  }
  if (question.type === "options") {
    const index = dataView.getInt8(0);
    const value = question.options[index - 1];
    if (optionsSet) {
      const options = getOptionSet(optionsSet, question.options);
      if (options) {
        return getOptionValue(options, value);
      }
    }
    return value;
  }
  // if (question.type === "multipleOptions") {
  //   // TODO
  //   return undefined;
  // }
  console.warn(`closedQuestionValue: ${question.type} is not implemented`);
  return undefined;
};

export async function* loadSphinxData(
  form: SphinxForm | string,
  repPath: string,
  ouvPath: string,
  options?: SphinxOptionsSet | string,
) {
  if (typeof form === "string") form = await loadSphinxForm(form);
  if (typeof options === "string") {
    options = await readYamlFile<SphinxOptionsSet>(options);
  }

  console.log("Record bytes length:", recordBytesLength(form));

  const rep = await Deno.open(repPath);
  // * Skip headers
  const headersData = new Uint8Array(FORM_HEADER_BYTES_LENGTH);
  await rep.read(headersData);

  const recordHeaders = new Uint8Array(RECORD_HEADER_BYTES_LENGTH);
  //   const rawRecord = new Uint8Array(recordBytesLength(form));
  let cursor = 0;
  const ouv = await Deno.open(ouvPath);
  const ouvIterator = await readStringDelim(ouv, "*");
  while (await rep.read(recordHeaders)) {
    const record: Record<string, any> = {};
    const rawOpenValues = await (await ouvIterator.next()).value;
    const openValues = rawOpenValues.split("|");
    let openValueIndex = 0;
    for (const question of form.questions) {
      const rawResponse = new Uint8Array(questionBytesLength(question));
      await rep.read(rawResponse);
      record[question.variable] = question.type === "open"
        ? openValues[openValueIndex++]
        : closedQuestionValue(question, rawResponse, options);
    }
    // console.log(record);
    yield record;
    ++cursor;
  }
  rep.close();
  ouv.close();
}
