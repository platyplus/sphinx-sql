import * as path from "https://deno.land/std/path/mod.ts";
import { loadSphinxData } from "./utils/sphinx/load-data.ts";
import { generateConfig } from "./utils/sphinx/generate-config.ts";

const schemaPath = path.join(Deno.cwd(), "schema");
const sphinxPath = path.join(schemaPath, "sphinx");
const dataPath = path.join(Deno.cwd(), "data");

await generateConfig(schemaPath, sphinxPath);
const data = await loadSphinxData(
  path.join("test", "Behavior_Data.que"),
  path.join("test", "Behavior_Data.rep"),
  path.join("test", "Behavior_Data.ouv"),
  path.join("schema", "options.yaml"),
);
