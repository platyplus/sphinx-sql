import * as path from "https://deno.land/std/path/mod.ts";
import { generateConfig } from "./utils/sphinx/generate-config.ts";

const schemaPath = path.join(Deno.cwd(), "schema");
const sphinxPath = path.join(schemaPath, "sphinx");

await generateConfig(schemaPath, sphinxPath);
