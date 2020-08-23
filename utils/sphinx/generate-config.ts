import * as path from "https://deno.land/std/path/mod.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";
import { ensureDir, exists } from "https://deno.land/std/fs/mod.ts";
import { merge } from "../deep-merge.ts";
import { writeYamlFile, readYamlFile } from "../yaml.ts";
import { loadSphinxForm } from "./load-form.ts";
import { SphinxQuestions, SphinxOptionsSet } from "./types.ts";
import { addOptionSet } from "./options-set.ts";

export const generateConfig = async (
  yamlPath: string,
  sphinxPath: string,
) => {
  let optionSets: Record<string, string[]> = {};

  console.log("[*] Generating table files...");
  const tablesPath = path.join(yamlPath, "tables");
  await ensureDir(tablesPath);
  for await (const file of expandGlob(path.join(sphinxPath, "*.que"))) {
    const name = file.name.substring(0, file.name.lastIndexOf(".que"));
    console.log(" ", name);
    const yamlFile = path.join(tablesPath, `${name}.yaml`);
    let form = await loadSphinxForm(file.path);
    if (await exists(yamlFile)) {
      const oldFile = await readYamlFile<SphinxQuestions>(yamlFile);
      form = merge(oldFile, form);
    }
    form.questions.forEach((question) =>
      (question.type === "options") &&
      addOptionSet(optionSets, question.options)
    );
    await writeYamlFile(yamlFile, form);
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

  console.log("[*] Config generated.");
};