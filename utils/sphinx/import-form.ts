import { readline } from "https://deno.land/x/readline/mod.ts";
import { snakeCase } from "https://deno.land/x/case/mod.ts";
import { set } from "../data/set-value.ts";
import { SphinxForm } from "./types.ts";

const arrayKeys = [
  "questions",
  "translations",
  "titles",
  "strata",
  "crossedSorts",
];

const dic: Record<string, string> = {
  "Questions": "questions",
  "Traductions": "translations",
  "Options": "options",
  "Titre": "title",
  "Titres": "titles",
  "Strates": "strata",
  "Strate": "stratum",
  "Version": "version",
  "Entête": "headers",
  "Historique": "history",
  "Langue": "language",
  "Période": "period",
  "Organisme": "organisation",
  "StadePanneau": "pannelStage",
  "Question": "question",
  "Libellé": "label",
  "Variable": "variable",
  "Type": "type",
  "NbLignes": "nbLines",
  "NbCarLigne": "nbCharLines",
  "Plan": "plan",
  "Attributs": "attributes",
  "Modalités": "options",
  "NbModalités": "nbOptions",
  "Première": "first",
  "NbCarCode": "nbCharCode",
  "Pondérations": "weights",
  "FichierCodes": "codesFile",
  "VariableAutomatique": "autoVariable",
  "NbDécimales": "nbDecimals",
  "Format": "format",
  "Basic": "vb",
  "OptionsBasic": "vbOptions",
  "MaxRéponses": "maxResponses",
  "Consigne": "instructions",
  "TypeNombre": "numberType",
  "RenvoisActifs": "resend",
  "ControlesActifs": "controls",
  "GroupesActifs": "groups",
  "MinNombre": "min",
  "MaxNombre": "max",
  "Nom": "name",
  "Active": "active",
  "Filtre": "filter",
  "Opérateur": "operator",
  "Compris": "included",
  "Rang": "rank",
  "TrisCroisés": "crossedSorts",
  "TriCroisé": "crossedSort",
  "Variable1": "var1",
  "Variable2": "var2",
  "Numérique": "isNumber",
};

// TODO set as an option (from yaml file) as it is too specific to the MdM schema
// ? define order of transformations?
type CustomValueTransformer = {
  removeRegexp?: string;
  maps?: Record<string, string>;
};

const customValueTransormers: Record<string, CustomValueTransformer> = {
  variable: {
    removeRegexp: "^[^_]*_", // Remove any variable 'xyz_' prefix
    maps: { cor_f: "c_or_f" },
  },
};

const zeroOneToBoolean = (value: string) => value === "1";

const basicValueTransformers: Record<string, (value: string) => any> = {
  language: (value) => value.toLowerCase(),
  options: (value) =>
    value.split(";").map((item) => item.trim()).filter((item) => item.length),
  groups: zeroOneToBoolean,
  resend: zeroOneToBoolean,
  controls: zeroOneToBoolean,
  plan: zeroOneToBoolean, // ? Not sure of it
  isNumber: zeroOneToBoolean,
  codesFile: (value) =>
    value.substring(
      value.lastIndexOf("\\") + 1,
    ),
  // ? Specific to MdM encoding. Set as a parameter somehow?
  variable: (value) => snakeCase(value),
  type: (type) => {
    if (type === "0") return "label";
    if (type === "1") return "options";
    if (type === "2") return "multipleOptions";
    if (type === "4") return "number";
    if (type === "6") return "open";
    if (type === "7") return "code";
    if (type === "8") return "date";
    console.warn(`Unknown type: ${type}`);
    return type;
  },
};

const getValue = (key: string, value: string) => {
  /**
   * * 1. remove regexp match (optional)
   * * 2. execute basic tranformation, if any
   * * 3. match mapped value (optional)
   */
  const custom = customValueTransormers[key];
  if (custom?.removeRegexp) {
    const re = new RegExp(custom.removeRegexp);
    value = value.replace(re, "");
  }
  if (basicValueTransformers[key]) value = basicValueTransformers[key](value);
  else {
    try {
      value = JSON.parse(value);
    } catch {}
  }
  return custom?.maps?.[value] || value;
};

const getKey = (key: string) => {
  const newKey = dic[key];
  if (!newKey) {
    console.warn(`Unknown key: ${key}`);
    return key;
  } else return newKey;
};

const getKeyValue = (line: string) => {
  const eq = line.indexOf("=");
  if (eq < 0) throw Error("no equals");
  const key = getKey(line.trim().substring(0, eq));
  const value = getValue(key, line.trim().substring(eq + 1));
  return { key, value };
};

export const importSphinxForm = async (fileName: string) => {
  const f = await Deno.open(fileName);
  const result = {} as SphinxForm;
  const arrayCounts: Record<number, number> = {};
  const processLine = (
    object: Record<string, any>,
    line: string,
    cursor: string[],
  ) => {
    if (line.startsWith("\t")) {
      processLine(object, line.substring(1), cursor);
    } else if (line === "Fin") {
      arrayCounts[cursor.length] = 0;
      cursor.pop();
    } else if (line.indexOf("=") >= 0) {
      const { key, value } = getKeyValue(line);
      const rootPath = (cursor.length ? `${cursor.join(".")}.` : "");
      set(object, rootPath + key, value);
    } else if (line.length) {
      const lastKey = cursor[cursor.length - 1];
      if (arrayKeys.includes(lastKey)) {
        const count = arrayCounts[cursor.length] || 0;
        arrayCounts[cursor.length] = count + 1;
        cursor.push(count.toString());
      } else {
        cursor.push(getKey(line));
      }
    }
  };
  const cursor: string[] = [];
  for await (
    const rawLine of readline(
      f,
      { separator: new TextEncoder().encode("\r\n") },
    )
  ) {
    const line = new TextDecoder("ascii").decode(rawLine);
    processLine(result, line, cursor);
  }
  f.close();
  return result;
};
