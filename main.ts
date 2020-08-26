import * as path from "https://deno.land/std/path/mod.ts";
import {
  sphinxData,
  generateConfig,
  generateSqlSchema,
} from "./utils/mod.ts";

const schemaPath = path.join(Deno.cwd(), "schema");
const sphinxPath = path.join(schemaPath, "sphinx");

const config = await generateConfig(schemaPath, sphinxPath);

console.log(await generateSqlSchema(config));
const dir = "data";
const batch = "Behavior_Data";

// const data = sphinxData(
//   path.join(sphinxPath, `${batch}.que`),
//   path.join(dir, `${batch}.rep`),
//   path.join(dir, `${batch}.ouv`),
//   path.join("schema", "options.yaml"),
// );

// for await (const record of data) {
//   console.log(record.date.dateBig);
// }
