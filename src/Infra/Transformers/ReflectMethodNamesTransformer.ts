import * as ts from "typescript";

const HTTP_DECORATORS = ["HttpGet", "HttpPost", "HttpPut", "HttpDelete"];

export default function ReflectParamsTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const parentStack: ts.Node[] = [];

    const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isDecorator(node)) {
        const name = getDecoratorName(node);
        if (name && HTTP_DECORATORS.includes(name)) {
          // Find the parent method/function in the stack
          for (let i = parentStack.length - 1; i >= 0; i--) {
            const parent = parentStack[i];
            if (
              ts.isMethodDeclaration(parent) ||
              ts.isFunctionDeclaration(parent)
            ) {
              return hydrateParamsArg(node, parent, context);
            }
          }
        }
      }

      // Track parent nodes
      parentStack.push(node);
      const result = ts.visitEachChild(node, visit, context);
      parentStack.pop();

      return result;
    };

    return (sourceFile) => ts.visitEachChild(sourceFile, visit, context);
  };
}

function hydrateParamsArg(
  decorator: ts.Decorator,
  methodNode: ts.MethodDeclaration | ts.FunctionDeclaration,
  context: ts.TransformationContext
): ts.Decorator {
  // Extract parameter descriptors from the method
  const paramDescriptors = methodNode.parameters
    .map((param, index) => {
      if (!ts.isIdentifier(param.name)) {
        return null;
      }

      const name = param.name.text;
      const isOptional = !!param.questionToken;
      const allowedTypes = extractAllowedTypes(param.type, isOptional, context);

      return context.factory.createObjectLiteralExpression(
        [
          context.factory.createPropertyAssignment(
            "index",
            context.factory.createNumericLiteral(index.toString())
          ),
          context.factory.createPropertyAssignment(
            "name",
            context.factory.createStringLiteral(name)
          ),
          context.factory.createPropertyAssignment(
            "AllowedTypes",
            context.factory.createArrayLiteralExpression(allowedTypes, false)
          ),
        ],
        false
      );
    })
    .filter((desc): desc is ts.ObjectLiteralExpression => desc !== null);

  const paramsArray = context.factory.createArrayLiteralExpression(
    paramDescriptors,
    false
  );
  const voidZero = context.factory.createVoidExpression(
    context.factory.createNumericLiteral("0")
  );

  const expr = decorator.expression;

  if (ts.isIdentifier(expr)) {
    return context.factory.createDecorator(
      context.factory.createCallExpression(expr, undefined, [
        voidZero,
        paramsArray,
      ])
    );
  }

  if (ts.isCallExpression(expr)) {
    const args = expr.arguments;
    const newArgs =
      args.length === 0
        ? [voidZero, paramsArray]
        : args.length === 1
        ? [args[0], paramsArray]
        : [args[0], paramsArray, ...args.slice(2)];

    return context.factory.createDecorator(
      context.factory.updateCallExpression(
        expr,
        expr.expression,
        expr.typeArguments,
        newArgs
      )
    );
  }

  return decorator;
}

function extractAllowedTypes(
  typeNode: ts.TypeNode | undefined,
  isOptional: boolean,
  context: ts.TransformationContext
): ts.Expression[] {
  const types: ts.Expression[] = [];

  if (isOptional) {
    types.push(context.factory.createStringLiteral("optional"));
  }

  if (!typeNode) {
    return types;
  }

  // Handle union types (e.g., string | number, type | undefined, type | null)
  if (ts.isUnionTypeNode(typeNode)) {
    for (const type of typeNode.types) {
      const extracted = extractTypeConstructor(type, context);
      if (extracted) {
        types.push(...extracted);
      }
    }
    return types;
  }

  // Handle single type
  const extracted = extractTypeConstructor(typeNode, context);
  if (extracted) {
    types.push(...extracted);
  }

  return types;
}

function extractTypeConstructor(
  typeNode: ts.TypeNode,
  context: ts.TransformationContext
): ts.Expression[] {
  const types: ts.Expression[] = [];

  // Handle undefined
  if (typeNode.kind === ts.SyntaxKind.UndefinedKeyword) {
    types.push(context.factory.createStringLiteral("undefined"));
    return types;
  }

  // Handle null (in TypeScript, null is represented as a literal type)
  if (ts.isLiteralTypeNode(typeNode)) {
    if (typeNode.literal.kind === ts.SyntaxKind.NullKeyword) {
      types.push(context.factory.createStringLiteral("null"));
      return types;
    }
  }

  // Handle primitive types by checking the kind
  const primitiveType = getPrimitiveConstructor(typeNode.kind);
  if (primitiveType) {
    types.push(context.factory.createIdentifier(primitiveType));
    return types;
  }

  // Handle type references (e.g., String, Number, custom classes)
  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = getTypeName(typeNode.typeName);
    if (typeName) {
      // Check if it's a primitive wrapper
      const primitiveWrapper = getPrimitiveWrapper(typeName);
      if (primitiveWrapper) {
        types.push(context.factory.createIdentifier(primitiveWrapper));
      } else {
        // For type aliases and interfaces (not constructors), use string literal
        // For actual classes, we'd reference them, but we can't distinguish at transform time
        // So we'll use string literal as a safe fallback that works at runtime
        types.push(context.factory.createStringLiteral(typeName));
      }
      return types;
    }
  }

  // Handle array types (e.g., string[])
  if (ts.isArrayTypeNode(typeNode)) {
    const elementTypes = extractTypeConstructor(typeNode.elementType, context);
    types.push(...elementTypes);
    return types;
  }

  // Default: if we can't determine the type, return empty (or could return Object)
  return types;
}

function getPrimitiveConstructor(keyword: ts.SyntaxKind): string | null {
  switch (keyword) {
    case ts.SyntaxKind.StringKeyword:
      return "String";
    case ts.SyntaxKind.NumberKeyword:
      return "Number";
    case ts.SyntaxKind.BooleanKeyword:
      return "Boolean";
    case ts.SyntaxKind.BigIntKeyword:
      return "BigInt";
    case ts.SyntaxKind.SymbolKeyword:
      return "Symbol";
    default:
      return null;
  }
}

function getPrimitiveWrapper(typeName: string): string | null {
  const lowerName = typeName.toLowerCase();
  switch (lowerName) {
    case "string":
      return "String";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "bigint":
      return "BigInt";
    case "symbol":
      return "Symbol";
    case "date":
      return "Date";
    default:
      return null;
  }
}

function getTypeName(typeName: ts.EntityName | ts.PropertyAccessEntityNameExpression): string | null {
  if (ts.isIdentifier(typeName)) {
    return typeName.text;
  } else if (ts.isQualifiedName(typeName)) {
    // Build qualified name string (e.g., "Types.RequestContext")
    const parts: string[] = [];
    let current: ts.QualifiedName | ts.Identifier = typeName;
    while (true) {
      if (ts.isIdentifier(current)) {
        parts.unshift(current.text);
        break;
      } else {
        parts.unshift(current.right.text);
        current = current.left;
      }
    }
    return parts.join(".");
  } else if (ts.isPropertyAccessExpression(typeName)) {
    // Build property access string (e.g., "Types.RequestContext")
    const parts: string[] = [];
    let current: ts.Node = typeName;
    while (true) {
      if (ts.isIdentifier(current)) {
        parts.unshift(current.text);
        break;
      } else if (ts.isPropertyAccessExpression(current)) {
        parts.unshift(current.name.text);
        current = current.expression;
        if (!ts.isPropertyAccessExpression(current) && !ts.isIdentifier(current)) {
          break;
        }
      } else {
        break;
      }
    }
    return parts.join(".");
  }
  return null;
}

function getDecoratorName(decorator: ts.Decorator): string | undefined {
  const expr = decorator.expression;
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isCallExpression(expr)) {
    const callee = expr.expression;
    if (ts.isIdentifier(callee)) return callee.text;
    if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  }
  return undefined;
}
