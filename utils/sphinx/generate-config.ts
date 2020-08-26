import * as path from "https://deno.land/std/path/mod.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";
import { ensureDir, exists } from "https://deno.land/std/fs/mod.ts";
import { merge } from "../data/mod.ts";
import { writeYamlFile, readYamlFile } from "../io/yaml.ts";
import { importSphinxForm } from "./import-form.ts";
import { SphinxForm, SphinxOptionsSet, SphinxConfig } from "./types.ts";
import { addOptionSet } from "./options-set.ts";

export const generateConfig = async (
  yamlPath: string,
  sphinxPath: string,
): Promise<SphinxConfig> => {
  let optionSets: SphinxOptionsSet = {};
  const codes: string[] = [];
  const forms: Record<string, SphinxForm> = {};

  console.log("[*] Generating table files...");
  const tablesPath = path.join(yamlPath, "tables");
  // TODO exit if no .que file
  await ensureDir(tablesPath);
  for await (const file of expandGlob(path.join(sphinxPath, "*.que"))) {
    const name = file.name.substring(0, file.name.lastIndexOf(".que"));
    console.log(" ", name);
    const yamlFile = path.join(tablesPath, `${name}.yaml`);
    let form = await importSphinxForm(file.path);
    if (await exists(yamlFile)) {
      const oldFile = await readYamlFile<SphinxForm>(yamlFile);
      form = merge(oldFile, form);
    }
    form.questions.forEach((question) => {
      if (question.type === "options") {
        addOptionSet(optionSets, question.options);
      }
      if (
        question.type === "code" && question.codesFile &&
        !codes.includes(question.codesFile)
      ) {
        codes.push(question.codesFile);
      }
    });
    await writeYamlFile(yamlFile, form);
    forms[name] = form;
  }

  console.log("[*] Generating options file...");
  const optionsFile = path.join(yamlPath, "options.yaml");
  if (await exists(optionsFile)) {
    const previousSet = await readYamlFile<SphinxOptionsSet>(optionsFile);
    Object.values(optionSets).forEach((value) =>
      addOptionSet(previousSet, value)
    );
    optionSets = previousSet;
  }
  await writeYamlFile(optionsFile, optionSets);

  console.log("[*] Generating codes file...");
  // TODO expandGlob / walk any dic/txt? or get the original path as per described in the .que files?
  // TODO OR, OR: find from the file names???
  console.log(codes);

  console.log("[*] Config generated.");
  return {
    options: optionSets,
    forms,
  };
};
