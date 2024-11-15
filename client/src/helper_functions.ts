import { builtInSignatures } from "./functions_builtin";


export function isWithinCommentBlock(document, lineNumber) {
  for (let i = lineNumber; i >= 0; i--) {
    const lineText = document.lineAt(i).text.trim();

    if ((lineText.startsWith('/*') || lineText.startsWith("/**")) && !lineText.endsWith('*/')) {
      return true;  // Found the start of an unclosed block comment
    }
    if (lineText.endsWith('*/')) {
      return false;  // Found the end of the block comment
    }
  }
  return false;
}

// Helper function to extract the function name from the text
export function extractFunctionName(lineText) {
  const match = lineText.match(/(\w+)\s*\(/);
  return match ? match[1] : null;
}
// Function signature database (simulate built-in library)
export function getFunctionSignature(functionName) {
  return builtInSignatures[functionName] || null;
}