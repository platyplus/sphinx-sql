import * as path from "https://deno.land/std/path/mod.ts";
import { expandGlob } from "https://deno.land/std/fs/mod.ts";
import { SphinxConfig, SphinxOptionsSet, SphinxForm } from "./types.ts";
import { readYamlFile } from "../io/yaml.ts";

export const loadConfig = async (configPath: string): Promise<SphinxConfig> => {
  const optionsFile = path.join(configPath, "options.yaml");
  const options = await readYamlFile<SphinxOptionsSet>(optionsFile);
  const forms: Record<string, SphinxForm> = {};
  const tables = path.join(configPath, "tables", "*.yaml");
  for await (
    const file of expandGlob(path.join(configPath, "tables", "*.yaml"))
  ) {
    forms[file.name] = await readYamlFile<SphinxForm>(file.path);
  }
  return { options, forms };
};
