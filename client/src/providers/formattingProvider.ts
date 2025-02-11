export function formatDocument(text: string): string {
  // Start by formatting curly braces
  let doc = formatCurlyBraces(text);
  // Then add spaces after commas
  doc = formatCommas(doc);
  // Format multi-line comments:
  doc = formatMultilineComments(doc);
  // Then format semicolons
  doc = addNewlinesAfterSemicolons(doc);

  // The make it process line by line
  let lines = doc.split('\n');
  const formattedLines: string[] = [];

  let indentLevel = 0;
  let isInBlockComment = false;


  for (let line of lines) {
    // Keep empty newlines as it is
    if (line.trim() === '') {
      formattedLines.push(line); // Keep the empty line as-is
      continue;
    }

    line = line.trim();

    // Format specific syntax
    line = formatOperators(line);
    line = formatSingleLineComments(line);

    // Handle closing braces
    if (line.startsWith('}')) {
      indentLevel = Math.max(indentLevel - 1, 0);
    }

    // Check if comment block is encountered
    if (line.startsWith("/*")) {
      isInBlockComment = true;
    }
    if (line.endsWith("*/")) {
      isInBlockComment = false;
      if (!line.startsWith("/*")) {
        line = line.replace(/^(?!.*\/\*).*?\*\/$/, (match) => match.replace(/(\*\/)/, ' $1'));
      }
    }

    // Check if still in comment
    if (isInBlockComment) {
      if (line.startsWith("*")) {
        line = ` ${line}`; // Add an extra space
      }
    }

    // Add indentation
    const indentedLine = `${'    '.repeat(indentLevel)}${line}`;
    formattedLines.push(indentedLine);

    // Handle opening braces
    if (line.endsWith('{') && !isInBlockComment && !(/\/\/|\/\*/.test(line))) {
      indentLevel++;
    }

  }

  return formattedLines.join('\n');
}

function formatCurlyBraces(input: string): string {
  // Remove newline before `{` and move it back to the previous line
  input = input.replace(/\n\s*{/g, ' {');

  // Ensure there is exactly 1 space before the opening `{`
  input = input.replace(/\s*{/g, ' {');

  // Ensure there is always a newline after the opening `{` without removing existing newlines
  input = input.replace(/({)(?!\n)/g, '$1\n');

  // Ensure `}` is on its own line and add a newline before it if needed
  input = input.replace(/([^\n])(\s*})(?!\n)/g, (match, p1, p2) => {
    // Only add newline if there isn't already a newline before the closing brace
    return /\n/.test(match) ? match : p1 + '\n' + p2;
  });


  // Add a newline after `}` only if there is no newline already
  input = input.replace(/}(?!\n)(?!\s*\n)(?!;)/g, '}\n');

  return input;
}

function addNewlinesAfterSemicolons(input: string): string {
  // Step 1: Add newline after semicolon if not followed by newline or comment (single-line or multi-line)
  input = input.replace(/;(?!\s*(?:\n|\/\/|\/\*[^*]*\*\/))(?=\s*(?!\n))(?=\s*(?![^*]*\*\/)[^]*\n)/g, ';\n');
  return input; // No need for .trim() to avoid stripping empty lines
}

function formatCommas(input: string): string {
  // Add a space after every comma if there isn't already one
  return input.replace(/,(?!\s)/g, ', ');
}

function formatMultilineComments(documentText: string): string {
  return documentText.replace(
    /(\/\*\*?)([\s\S]*?)\*\//g,
    (match, openingBlock, commentBody) => {
      // Preserve the opening block exactly as it is
      const opening = openingBlock;

      // If the comment body is empty or just contains stars, return the comment as is
      if (!commentBody.trim()) {
        return `${opening} */`;
      }

      // Check if it's a single-line comment (start and end on the same line)
      if (!commentBody.includes('\n')) {
        // Trim the body and return it in the same line
        return `${opening} ${commentBody.trim()} */`.replace(/\s+/g, ' ');
      }

      // Otherwise, it's a multi-line comment
      const lines = commentBody.split('\n');

      // Process each line of the comment
      const formattedLines = lines.map((line) => {
        const trimmedLine = line.trim();

        // Skip empty or '*' only lines
        if (trimmedLine === '' || trimmedLine === '*') {
          return null;
        }

        // Keep the line as it is, but ensure only one star at the start
        let formattedLine = trimmedLine;

        // If the line doesn't start with a star, add one
        if (!formattedLine.startsWith('*')) {
          formattedLine = `* ${formattedLine}`;
        } else {
          // Otherwise, just ensure a single star at the beginning
          formattedLine = `* ${formattedLine.slice(1).trim()}`;
        }

        return formattedLine;
      });

      // Remove null (empty) lines from the formatted array
      const cleanedLines = formattedLines.filter(line => line !== null);

      // Reassemble the comment with a newline between each line and properly closed
      const closing = '*/';
      const body = cleanedLines.join('\n');
      return `${opening}\n${body}\n${closing}`;
    }
  );
}


function formatOperators(input: string): string {
  const operatorRegex = /([^\s])([+\-*/%^=<>!&|])([^\s])/g;
  const excludedOperators = /[+\-*/%^=<>!&|]{2,}/; // Exclude repeated/multiple operators like ++, --, **, etc.

  function formatExpression(expression: string): string {
    return expression.replace(operatorRegex, (match, left, op, right) => {
      // Ignore multiple operators in a row
      if (excludedOperators.test(op)) {
        return match;
      }
      if (right === ';') {
        return match;
      }
      return `${left} ${op} ${right}`;
    });
  }

  function formatNested(content: string): string {
    let previousContent;
    do {
      previousContent = content;
      content = content.replace(/\(([^()]+)\)/g, (match, innerContent) => {
        return `(${formatExpression(innerContent)})`;
      });
    } while (content !== previousContent); // Stop when no more changes are made

    // Format the remaining expression outside parentheses
    return formatExpression(content);
  }

  return input.replace(/\/[*][\s\S]*?[*]\//g, match => match) // Ignore multiline comments
    .replace(/\/\/[^\n]*/g, match => match) // Ignore single-line comments
    .replace(/['"`][^'"`]*['"`]/g, match => match) // Ignore strings
    .replace(/\bhttps?:\/\/[^\s)]+/g, match => match) // Ignore URLs
    .replace(/[^\s()]+/g, token => {
      // Only format valid expressions
      if (excludedOperators.test(token)) {
        return token;
      }
      return formatNested(token);
    });
}

function formatSingleLineComments(line: string): string {
  // Ensure there is a space before `//`, but ignore URLs starting with `://`
  line = line.replace(/([^:])\/\/(?! )/g, '$1 // '); // Add a space before `//` if not preceded by a colon
  // Ensure there is a space after `//`, but ignore if it's part of a URL (contains colon before `//`)
  line = line.replace(/([^:])\/\/(?! )/g, '$1 // '); // Ensures space after `//` if not already present and not part of a URL

  return line;
}

export function formatFileHeader(content: string, fileName: string, creationDate: string, lastModifiedDate: string): string {
  const headerRegex = /^\/\*\*[\s\S]*?\*\/\n?/; // Match the header block only at the top of the file
  const lastModifiedRegex = /(Last Modified on: ).*/;

  // If a header already exists, update "Last Modified on:"
  if (headerRegex.test(content)) {
    return content.replace(headerRegex, (header) => {
      // Update or add the "Last Modified on:" field in the existing header
      if (lastModifiedRegex.test(header)) {
        return header.replace(lastModifiedRegex, `$1${lastModifiedDate}`);
      } else {
        // Add "Last Modified on:" if it doesn't exist
        const headerLines = header.split('\n');
        headerLines.splice(headerLines.length - 1, 0, ` * Last Modified on: ${lastModifiedDate}`);
        return headerLines.join('\n');
      }
    });
  }

  // If no header exists, add a new one at the top
  const newHeader = `/**
 * @file ${fileName}
 * @author 
 * @brief 
 * @date ${creationDate}
 * Last Modified on: ${lastModifiedDate}
 */

`;
  return newHeader + content;
}