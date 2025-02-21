// Copyright (c) 2024-25 Darshan(@thisisthedarshan)
// Licensed under the MIT License. See LICENSE file for details.
import * as fsp from 'fs/promises';

export async function getCreationDate(filePath: string): Promise<Date> {
  try {
    const stats = await fsp.stat(filePath); // Get file metadata
    return stats.birthtime; // Return the creation date
  } catch (error) {
    console.error('Failed to get file creation date:', error);
    throw new Error('Could not retrieve creation date');
  }
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