import * as path from "https://deno.land/std/path/mod.ts";
import { loadRawSphinxData } from "./utils/sphinx/load-data.ts";
import { generateConfig } from "./utils/sphinx/generate-config.ts";

const schemaPath = path.join(Deno.cwd(), "schema");
const sphinxPath = path.join(schemaPath, "sphinx");

// await generateConfig(schemaPath, sphinxPath);

const dir = "data";
const batch = "Behavior_Data";

const data = loadRawSphinxData(
  path.join(sphinxPath, `${batch}.que`),
  path.join(dir, `${batch}.rep`),
  path.join(dir, `${batch}.ouv`),
);

for await (const record of data) {
  // console.log(record);
}
