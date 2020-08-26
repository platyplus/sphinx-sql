import { Yargs, YargsType, Arguments } from "https://deno.land/x/yargs/deno.ts";
import { generateConfig, generateSqlSchema } from "./utils/mod.ts";

const scriptName = Deno.mainModule.substring(
  Deno.mainModule.lastIndexOf("/") + 1,
);

type ConfigFileUriArguments = Arguments & {
  config: string;
  file: string;
  host: string;
};
const configFileUriOptions = (yargs: YargsType) =>
  yargs.option("config", {
    alias: "c",
    default: ".",
    defaultDescription: "current directory",
    describe: "The directory that contains the config files",
    type: "string",
  }).option("file", {
    alias: "f",
    describe: "File output",
    type: "string",
  }).option("host", {
    alias: "h",
    describe: "PostgreSQL conection URI",
    type: "string",
  });

Yargs()
  .scriptName(scriptName)
  .command(
    "config [source] [destination]",
    "Create or update the configuration from Sphinx files",
    (yargs: YargsType) => {
      // TODO not positional, but optional
      return yargs.positional("source", {
        describe: "The directory that contains the Sphinx questionnaire files",
        type: "string",
        default: ".",
        defaultDescription: "current directory",
      }).positional(
        "destination",
        {
          describe:
            "The directory where the config files will be created or updated",
          type: "string",
          default: ".",
          defaultDescription: "current directory",
        },
      );
    },
    async (
      { source, destination }: Arguments & {
        source: string;
        destination: string;
      },
    ) => {
      await generateConfig(destination, source);
    },
  )
  .command(
    "schema",
    "Generate the SQL schema. \nSave it to a file and/or load it to a PostgreSQL database.\nPrints to stdout otherwise",
    configFileUriOptions,
    async ({ config, file, host }: ConfigFileUriArguments) => {
      const result = await generateSqlSchema(config);
      if (!file && !host) console.log(result);
      if (file) {
        await Deno.writeTextFile(file, result);
      }
      if (host) {
        console.log("TODO insert schema to DB"); // TODO
      }
    },
  )
  .command(
    "data",
    "Generate the SQL data. \nOptionally save it to a file and/or load it to a PostgreSQL database.\nPrints to stdout otherwise",
    configFileUriOptions,
    async ({ config, file, host }: ConfigFileUriArguments) => {
      const result = "TODO sql data"; //await generateSqlSchema(config);
      if (!file && !host) console.log(result);
      if (file) {
        await Deno.writeTextFile(file, result);
      }
      if (host) {
        console.log("TODO insert data to DB"); // TODO
      }
      // TODO
      console.info("generate SQL data");
    },
  )
  .strictCommands()
  .demandCommand(1)
  .wrap(null)
  .parse(Deno.args);
