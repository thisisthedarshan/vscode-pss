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


export function getActiveParameter(lineText, cursorPosition) {
  const params = extractFunctionParameters(lineText);  // Extract the parameters as before
  let activeParam = 0;

  let currentPos = 0;
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const paramStart = currentPos;
    const paramEnd = currentPos + param.length;

    // Adjust for spaces or commas
    if (cursorPosition >= paramStart && cursorPosition <= paramEnd) {
      activeParam = i;
      break;
    }

    // Move to the start of the next parameter
    currentPos = paramEnd + 1;
  }

  return activeParam;
}

function extractFunctionParameters(lineText) {
  // Look for the content between the parentheses
  const paramStart = lineText.indexOf('(');
  const paramEnd = lineText.indexOf(')', paramStart);
  const paramText = lineText.slice(paramStart + 1, paramEnd).trim();

  // If there are no parameters, return an empty array
  if (paramText === "") return [];

  // Split parameters by commas
  return paramText.split(',').map(param => param.trim());
}