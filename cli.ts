#!/usr/bin/env node
import * as commander from "commander";
import CaseTransformer, { TransfromRules } from "./lib/transformer";

type RunOption = {
  case: TransfromRules;
  print: boolean;
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
    .action((sourceFilePath: string, command: RunOption) => {
      console.log(sourceFilePath, command);
      const caseTransformer = new CaseTransformer(command.case);
      caseTransformer.replaceFile(sourceFilePath);
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
