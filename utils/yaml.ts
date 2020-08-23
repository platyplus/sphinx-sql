import { stringify, parse } from "https://deno.land/std/encoding/yaml.ts";

export const writeYamlFile = async (path: string, obj: object) =>
  await Deno.writeTextFile(
    path,
    stringify(obj),
  );

export const readYamlFile = async <T extends object>(path: string) =>
  parse(
    await Deno.readTextFile(path),
  ) as T;
