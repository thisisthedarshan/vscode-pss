/*
 * Copyright (C) 2025 Darshan(@thisisthedarshan)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };
  return date.toLocaleString('en-US', options).replace(/,/, '').replace(/(\d+):(\d+) (AM|PM)/, '$1:$2 $3');
}

export function formatFileHeader(content: string, fileName: string, creationDate: string, lastModifiedDate: string, author: string): string {
  const headerRegex = /^\/\*\*[\s\S]*?\*\/\n?/;

  if (headerRegex.test(content)) {
    const header = content.match(headerRegex)![0];

    // Parse header content into lines
    const headerLines = header
      .replace(/^\/\*\*\s*\n/, '')
      .replace(/\s*\*\/\s*$/, '')
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .filter(line => line !== '');

    // Extract tagged values and check for their existence
    const hasFileTag = headerLines.some(line => line.trim().startsWith('@file'));
    const hasAuthorTag = headerLines.some(line => line.trim().startsWith('@author'));
    const hasDateTag = headerLines.some(line => line.trim().startsWith('@date'));
    const hasLastModified = headerLines.some(line => line.trim().startsWith('Last Modified on:'));

    // Create the new header lines
    let newHeaderLines = [];

    // Add @file tag at the beginning if missing
    if (!hasFileTag) {
      newHeaderLines.push(`@file ${fileName}`);
    }

    // Add all existing lines except @author, @date, and Last Modified
    for (const line of headerLines) {
      if (!line.trim().startsWith('@author') &&
        !line.trim().startsWith('Last Modified on:') &&
        (hasDateTag || !line.trim().startsWith('@date'))) {
        newHeaderLines.push(line);
      }
    }

    // Add @date if it doesn't exist
    if (!hasDateTag) {
      newHeaderLines.push(`@date ${creationDate}`);
    }

    // Add @author tag at the end if missing
    if (!hasAuthorTag) {
      newHeaderLines.push(`@author ${author}`);
    } else {
      // If author exists, find and move it to the end
      const authorLine = headerLines.find(line => line.trim().startsWith('@author'));
      newHeaderLines.push(authorLine || `@author ${author}`);
    }

    // Add Last Modified at the end
    newHeaderLines.push(`Last Modified on: ${lastModifiedDate}`);

    // Format the header with the new order
    const newHeader = [
      '/**',
      ...newHeaderLines.map(line => ` * ${line}`),
      ' */'
    ].join('\n') + '\n';

    return content.replace(headerRegex, newHeader);
  }

  // No header exists; prepend a new header
  const newHeader = `/**
 * @file ${fileName}
 * @brief 
 * @date ${creationDate}
 * @author ${author}
 * Last Modified on: ${lastModifiedDate}
 */
`;
  return newHeader + content;
}