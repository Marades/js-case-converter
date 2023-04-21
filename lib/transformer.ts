import ts from "typescript";

type TransfromRule = keyof typeof transfromRules;
const transfromRules = {
  snake: (text: string): string => {
    return text.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },
  camel: (text: string): string => {
    return text.replace(/([_][a-z])/g, (group) =>
      group.toUpperCase().replace("_", "")
    );
  },
} as const;

export class CaseTransformer {
  to: (input: string) => string;

  constructor(rule: TransfromRule) {
    if (!(rule in transfromRules)) {
      throw "Invalid Case Rule";
    }

    this.to = transfromRules[rule];
  }

  getTransformer(): ts.TransformerFactory<ts.SourceFile> {
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
}
