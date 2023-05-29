#!/usr/bin/env node
import * as commander from "commander";
import CaseTransformer, { TransfromRules } from "./lib/transformer";
import { readdirSync, statSync } from "fs";
import { join } from "path";

type RunOption = {
  case: TransfromRules;
  print: boolean;
  directory: boolean;
};

const bootstrap = () => {
  const program = commander.program;
  program
    .version(
      require("./package.json").version,
      "-v, --version",
      "Output the current version."
    )
    .usage("<command> [options]")
    .helpOption("-h, --help", "Output usage information.");

  program
    .command("run [sourceFilePath]")
    .description("Change target file's case")
    .option("-c, --case [case]", "select target case(snake, camel)")
    .option("-p, --print", "either print output")
    .option("-d --directory", "change all ts/js file in directory")
    .action((sourceFilePath: string, command: RunOption) => {
      console.log(sourceFilePath, command);
      const caseTransformer = new CaseTransformer(command.case);

      if (command.directory) {
        const files = readdirSync(sourceFilePath);
        files
          .map((file) => join(sourceFilePath, file))
          .filter((file) => statSync(file).isFile())
          .forEach((file) => caseTransformer.replaceFile(file));
      } else {
        caseTransformer.replaceFile(sourceFilePath);
      }

      if (command.print) {
        caseTransformer.print(sourceFilePath);
      }
    });

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
};

bootstrap();
