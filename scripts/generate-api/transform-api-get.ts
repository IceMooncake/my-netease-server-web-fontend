import ts from 'typescript'
import fs from 'fs'
import path from 'path'
import { prettierLog } from '../utils/prettier-log'
import { SERVICE_DIR } from './path'

const { pStrong, pError, pSuccess } = prettierLog({
  moduleName: 'Transform-api-get',
})

// Target directory
const targetDir = SERVICE_DIR

if (!fs.existsSync(targetDir)) {
  pError('Directory not found:', targetDir)
  process.exit(1)
}

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

// Check whether request method is GET
function isGetRequest(obj: ts.ObjectLiteralExpression) {
  return obj.properties.some(
    (p) =>
      ts.isPropertyAssignment(p) &&
      p.name.getText() === 'method' &&
      p.initializer.getText().includes('GET'),
  )
}

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  const visit: ts.Visitor = (node) => {
    // Match static method with return statement
    if (ts.isMethodDeclaration(node) && node.body) {
      const returnStmt = node.body.statements.find(ts.isReturnStatement)

      if (returnStmt && returnStmt.expression && ts.isCallExpression(returnStmt.expression)) {
        const call = returnStmt.expression
        const arg = call.arguments[1]

        if (arg && ts.isObjectLiteralExpression(arg) && isGetRequest(arg)) {
          const originalParams = node.parameters

          // Skip methods without parameters
          if (originalParams.length === 0) return node
          // Skip if already using params
          if (originalParams.length === 1 && originalParams[0].name.getText() === 'params') {
            return node
          }

          // Build params type literal
          const members = originalParams.map((p) =>
            ts.factory.createPropertySignature(
              undefined,
              p.name.getText(),
              p.questionToken,
              p.type,
            ),
          )

          const paramsParam = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            'params',
            undefined,
            ts.factory.createTypeLiteralNode(members),
            undefined,
          )

          // Rewrite query/path to params access
          const newProps = arg.properties.map((p) => {
            if (!ts.isPropertyAssignment(p)) return p

            const propName = p.name.getText()

            if (
              (propName === 'query' || propName === 'path') &&
              ts.isObjectLiteralExpression(p.initializer)
            ) {
              const innerProps = p.initializer.properties.map((innerP) => {
                if (ts.isPropertyAssignment(innerP) && ts.isIdentifier(innerP.initializer)) {
                  return ts.factory.updatePropertyAssignment(
                    innerP,
                    innerP.name,
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier('params'),
                      innerP.initializer,
                    ),
                  )
                }
                return innerP
              })

              return ts.factory.updatePropertyAssignment(
                p,
                p.name,
                ts.factory.updateObjectLiteralExpression(p.initializer, innerProps),
              )
            }

            return p
          })

          const newArg = ts.factory.updateObjectLiteralExpression(arg, newProps)

          const newCall = ts.factory.updateCallExpression(
            call,
            call.expression,
            call.typeArguments,
            [call.arguments[0], newArg],
          )

          const newBody = ts.factory.updateBlock(node.body, [
            ts.factory.createReturnStatement(newCall),
          ])

          return ts.factory.updateMethodDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.questionToken,
            node.typeParameters,
            [paramsParam],
            node.type,
            newBody,
          )
        }
      }
    }

    return ts.visitEachChild(node, visit, context)
  }

  return (node) => ts.visitNode(node, visit) as ts.SourceFile
}

// Recursively walk directory
function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!entry.isFile()) continue
    if (!fullPath.endsWith('.ts')) continue
    if (fullPath.endsWith('.d.ts')) continue

    transformFile(fullPath)
  }
}

// Transform single file
function transformFile(filePath: string) {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const result = ts.transform(sourceFile, [transformer])
  const transformed = printer.printFile(result.transformed[0] as ts.SourceFile)

  if (transformed !== sourceText) {
    fs.writeFileSync(filePath, transformed, 'utf8')
    pStrong('✔ transformed:', filePath)
  }
}

// Start
walk(targetDir)

pSuccess('ALL SUCCESS')
