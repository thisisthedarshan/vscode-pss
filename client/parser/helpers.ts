import { builtInSignatures } from "../definitions/builtinFunctions";

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