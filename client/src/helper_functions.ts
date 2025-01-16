import { builtInSignatures } from "./definitions/builtinFunctions";
import * as vscode from 'vscode';
import { keywords } from "./definitions/keywords";
import * as fs from 'fs';
import * as path from 'path';
import * as fsp from 'fs/promises';

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
  if (paramText === "") { return []; }

  // Split parameters by commas
  return paramText.split(',').map(param => param.trim());
}

export function countLeadingSpaces(text) {
  let count = 0;
  while (text[count] === ' ') {
    count++;
  }
  return count;
}

function parseDocumentBlock(doc: string, functionName: string): string {
  const lines = doc.split('\n');
  let description = '';
  const paramsDescription: { [key: string]: string } = {};
  let returnDescription = '';
  let currentParam: string | null = null;
  let currentDescription: string = '';

  // Check if the doc starts with /** for JSDoc-style comments
  if (lines[0].trim().startsWith('/**')) {
    // Parsing logic for JSDoc-style comments
    let parsingBlock = '';  // To store the current block being parsed

    lines.forEach(line => {
      line = line.trim();

      // Match and process @brief
      const briefMatch = line.match(/^\*\s?@brief/);
      if (briefMatch) {
        // Continue appending to description as @brief might span multiple lines
        description += line.replace(briefMatch[0], '').trim() + ' ';
      }

      // Match and process @param
      const paramMatch = line.match(/^\*\s?@param/);
      if (paramMatch) {
        // Extract the parameter details
        if (currentParam) {
          // If a parameter block was previously being processed, store it
          paramsDescription[currentParam] = currentDescription.trim();
        }

        // Reset and start capturing for the new parameter
        const paramParts = line.replace(paramMatch[0], '').trim().split(' ');
        const paramName = paramParts[0];
        const paramDesc = paramParts.slice(1).join(' ').trim() || "";

        currentParam = paramName;
        currentDescription = paramDesc + ' ';
      }

      // Match and process @return or @returns
      const returnMatch = line.match(/^\*\s?@(return|returns)/);
      if (returnMatch) {
        returnDescription += line.replace(returnMatch[0], '').trim() + ' ';
      }

      // If no more @param or @return symbols, continue appending to the current description block
      if (!briefMatch && !paramMatch && !returnMatch) {
        if (currentParam) {
          // If we're processing a parameter, append the line to its description
          currentDescription += line.replace('*', '').trim() + ' ';
        } else if (returnDescription !== '') {
          // If returnDescription is non-empty, continue appending lines to return text
          returnDescription += line.replace('*', '').trim() + ' ';
        } else if (description !== '') {
          // If we're in the description block, append the line to the description
          description += line.replace('*', '').trim() + ' ';
        }
      }
    });

    // If a param block is still being processed at the end, store it
    if (currentParam) {
      paramsDescription[currentParam] = currentDescription.trim();
    }
  } else {
    // If the doc doesn't start with /**, remove the comment marks but preserve the content
    let isFirstLine = true;
    doc.split('\n').forEach(line => {
      line = line.trim();

      // Remove /* from the first line
      if (isFirstLine && line.startsWith('/*')) {
        line = line.replace('/*', '').trim();
        isFirstLine = false;  // Set isFirstLine to false after the first line is processed
      } else if (line.startsWith('*')) {
        // Remove * from the beginning of subsequent lines
        line = line.replace(/^\*\s?/, ''); // Remove leading * from each line
      }
      // Add the cleaned line to the description
      description += line + '\n';
    });
  }

  // Generate markdown for function signature
  let markdown = `### ${functionName}\n\n`;
  markdown += `${description || 'No description available.'}\n\n`;

  // Append return description
  if (returnDescription) {
    markdown += `**Return**\n${returnDescription.trim() || 'No return description available.'}\n\n`;
  }

  // Append parameter descriptions
  if (Object.keys(paramsDescription).length > 0) {
    markdown += `**Parameters**\n\n`;
    for (const paramName in paramsDescription) {
      if (paramsDescription.hasOwnProperty(paramName)) {
        markdown += `- \`${paramName}\`: ${paramsDescription[paramName] || 'No description available.'}\n`;
      }
    }
  }

  return markdown;
}



/**
* This function searches across all open files for comments related to the keyword.
* @param {string} keyword - The word under the cursor that the user is hovering over (e.g., function name).
* @returns {Promise<string|null>} - The comment related to the keyword, or null if not found.
*/
export async function getCommentForKeyword(variableName, cache) {
  let foundComment = null;

  // Iterate through the keywords and find their description - for hover over keywords
  for (let i = 0; i < keywords.list.length; i++) {
    if (keywords.list[i] === variableName) {
      foundComment = keywords.descriptions[i];
      break;
    }
  }

  if (foundComment === null) {
    for (let keyword in cache) {
      for (let entry of cache[keyword]) {
        // Compare the variableName to entry.variableName, not to keyword
        if (entry.variableName === variableName) {
          return entry.comment;
        }
      }
    }
  }

  console.log("Found comment for variableName:", variableName, " as ", foundComment);

  return foundComment;
}

function getFilesInFolder(folderPath) {
  return fs.readdirSync(folderPath).filter(file => {
    return file.endsWith('.pss');
  }).map(file => path.join(folderPath, file));
}

// Look for a comment preceding the variable, either as a block comment or a single-line comment
function findCommentForVariable(lines, lineNumber, variable) {
  let inMultilineComment = false;
  let startLine = -1;
  let endLine = -1;

  // Look backwards for multi-line comments or single-line comments
  for (let i = lineNumber - 1; i >= 0; i--) {
    let line = lines[i].trim();
    if (line.startsWith('//')) {
      startLine = i;
      if (endLine === -1) {
        endLine = i;
      }
    }
    else if (line.endsWith('*/')) {
      endLine = i;
      inMultilineComment = true;
    } else if (line.startsWith('/*') || line.startsWith('/**')) {
      startLine = i;
      break;
    } else {
      if (!inMultilineComment) {
        break;
      }
    }
  }

  if (startLine === -1 || endLine === -1) {
    return "";
  }
  let comment = '';
  for (let j = startLine; j < endLine; j++) {
    comment += lines[j];
    comment += "\n";
  }
  if (startLine === endLine) {
    comment = lines[startLine];
  }

  let parsedResult = null;
  if (inMultilineComment) {
    parsedResult = parseDocumentBlock(comment, variable);
  }
  else {
    parsedResult = comment.replace(/^\s*\/\/\s*/gm, '');
  }

  return parsedResult;
}


function extractVariableNamesFromFile(fileContent) {
  const regex = new RegExp(`\\b(${keywords.list.join('|')})\\s+([a-zA-Z_][a-zA-Z0-9_]*)(\\s*=\\s*[^,;]*)?([,;])`, 'g');
  const lines = fileContent.split('\n'); // Split content into lines for easier line-by-line processing
  let match;
  let cache = {};

  // Iterate through all lines
  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    let line = lines[lineNumber].trim();

    // Check for variable definitions with keywords
    while ((match = regex.exec(line)) !== null) {
      const keyword = match[1];
      const varName = match[2];
      let commentString = '';

      // Look for comments preceding the variable
      commentString = findCommentForVariable(lines, lineNumber, varName);

      // If no comment was found, we set it to an empty string
      if (!commentString) {
        commentString = "";
      }

      // Store the variable, associated keyword, and comment in the cache
      if (!cache[keyword]) {
        cache[keyword] = [];
      }

      cache[keyword].push({ variableName: varName, comment: commentString });
    }
  }
  return cache;
}

// Initialize the cache when the extension first loads
export function initializeCache() {
  const activeEditor = vscode.window.activeTextEditor;
  const folderPath = vscode.workspace.rootPath;
  let cache = {};
  if (activeEditor) {
    // Initialize the cache from the current active file
    const fileContent = activeEditor.document.getText();
    cache = extractVariableNamesFromFile(fileContent);
  }

  if (folderPath) {
    // If a folder is open, process all files in the folder
    const files = getFilesInFolder(folderPath);
    files.forEach(file => {
      const fileContent = fs.readFileSync(file, 'utf-8');
      cache = extractVariableNamesFromFile(fileContent);
    });
  }
  return cache;
}

export function updateCacheOnSaveOrOpen(document) {
  if (document.languageId !== 'pss') { return; }

  const fileContent = document.getText();
  return extractVariableNamesFromFile(fileContent);
}


export async function getCreationDate(filePath: string): Promise<Date> {
  try {
    const stats = await fsp.stat(filePath); // Get file metadata
    return stats.birthtime; // Return the creation date
  } catch (error) {
    console.error('Failed to get file creation date:', error);
    throw new Error('Could not retrieve creation date');
  }
}