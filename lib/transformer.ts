import { writeFileSync } from "fs";
import ts from "typescript";

export type TransfromRules = keyof typeof transfromRules;
const transfromRules = {
  snake: (text: string): string => {
    return text.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  },
  camel: (text: string): string => {
    return text.replace(/([_][a-z])/g, (group) =>
      group.toUpperCase().replace("_", "")
    );
  },
} as const;

export default class CaseTransformer {
  private to: (input: string) => string;

  constructor(targetCase: TransfromRules) {
    if (!(targetCase in transfromRules)) {
      throw "Invalid Case Rule";
    }

    this.to = transfromRules[targetCase];
  }

  private getTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => (sourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isIdentifier(node)) {
          const originalName = node.getText(sourceFile);
          const snakeCaseName = this.to(originalName);

          return ts.factory.createIdentifier(snakeCaseName);
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitEachChild(sourceFile, visitor, context);
    };
  }

  exec(sourceFilePath: string) {
    const program = ts.createProgram([sourceFilePath], {});
    const sourceFile = program.getSourceFile(sourceFilePath)!;

    const transformer = this.getTransformer();
    const result = ts.transform(sourceFile, [transformer]);

    return result;
  }

  print(sourceFilePath: string) {
    const result = this.exec(sourceFilePath);
    const printer = ts.createPrinter();
    console.log(printer.printFile(result.transformed[0]));
  }

  replaceFile(sourceFilePath: string) {
    const result = this.exec(sourceFilePath);
    const printer = ts.createPrinter();
    writeFileSync(
      sourceFilePath,
      printer.printFile(result.transformed[0]),
      "utf8"
    );
  }
}
