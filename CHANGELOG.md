# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- A new Header formatter for the client

### Fixed

- Updated the language configuration to properly handle adding of the asterisk when using multiline comments.
- Fixed highlighting grammar and updated logic to highlight nested function calls and template items.

## [1.3.2] - 2025-04-14

### Added

- Custom request for client to get doxygen comment (generation of comments) for a line. The request is sent to the server and the server figures-out the the proper comment data.
- Support for goto declaration and references

## [1.3.1] - 2025-04-10

### Fixed

- Dependency issue for a new server library

## [1.3.0] - 2025-04-09

### Added

- Added highlighting for custom component names (user defined components with _c in them)
- Added settings option to let user select what symbols to order with.
- Added highlighting for register access constants and struct endianness constant keywords
- Added highlighting for custom action names (user defined actions with _a in them)
- **Finally** Added server to git repo - was missing from previous releases 😅
- Added markdown highlighting for PSS code in markdown!
- The parser structure is changed from the server with more enhancements such as hierarchial ast building, capturing of user-defined data types, assignments, etc.
- Added hover provider to the server

### Fixed

- Updated language config to not add additional asterisk when pressing enter on multiline comment.
- Updated word-patterns and indentation rules for better handling
- Fixed non-highlighting of functions with keywords like do.
- Updated scope for user-defined component, action, enum, typedef, structs, buffers types
- Updated the keywords and their descriptions to add more info and missing data.

## [1.2.2] - 2025-03-06

### Fixed

- The goto definition logic was fixed to provide proper goto definitions.
- The server also requests the client to refresh semantic tokens on document save.
- Added typecheck to ensure that non-null objects aren't accidentally called

### Changed

- The server now scans for local folder of opened pss file, even if no workspace is provided. This is because PSS files can be dependent on other pss files. This only works once so, in later versions we will have an optimized version.

## [1.2.0] - 2025-03-03

### Added

- Semantic highlighting support through server
- Goto definitions support

### Changed

- The highlighting priority is changed through textmate.

## [1.1.6] - (unreleased)

### Added

- New formatting logic from LSP

## [1.1.5] - 2025-02-24

### Changed

- Updated the formatter to ignore empty lines and drop any spaces in it.
- Fixed diagnostics popup issue

## [1.1.3] - 2025-02-24

### Added

- Signature provider was introduced for built-in functions

### Changed

- The formatter was updated in the server

## [1.1.1] - 2025-02-24

### Changed

- The options for client were updated to provide formatting and workspace details to server

## [1.1.0] - 2025-02-21

### Added

- The LSP from a new project - [pss-langserver](https://github.com/thisisthedarshan/pss-langserver.git). This LSP will now be the backend of the whole extension.

### Updated

- Updated eslint to reflect new server code
- Removed old server code

## [0.4.1] - 2025-02-12

### Changed

- Fixed the formatter bug which un-intentionally used a commented closing brace "}" to identify indentation width.

## [0.4.0] - 2025-02-11

### Added

- The build system is updated to bundle the extension using `esbuild`

### Changed

- Added release generation script
- Updated logic to detect functions, excluding logic blocks.
- Updated syntax for inheritance operator.
- Updated formatter to exclude counting commented "{" for determining tabspace
- Moved the client source directly into client directory instead of client/src directory
- Updated client's tsconfig file
- Added old build command to script
- Updated esbuild script to output extension in a specific format. Updated the entry point in Package JSON.
- Updated logic for adding "*" when formatting multiline comments - this may cause unwanted outcomes so dropped it. Instead, the updated language-config should handle this internally.
- Made minor changes to server invocation code to prepare for later changes

### Removed

- Old and unused package.json and package-lock.json from client directory
- Dropped unnecessary exports in client/extension.ts file
- Dropped unnecessary commented code in extension.ts
- Dropped unwanted log statement in getComment logic.

## [0.3.11] - 2025-02-10

### Changed

- Updated doxygen syntax highlighting to include *details* command
- Updated the Display name in settings
- Updated logic for adding * in single multi-line comment

## [0.3.10] - 2025-02-10

### Added

- Syntax highlighting for comparison operators.
- Added scope highlighting for "comp" keyword.
- Added missing data types - bit, bool
- Added syntax highlighting for buffer types (ending with \_b) and structs (ending with \_s)
- Added the ability to auto-add "*" when commenting in multiline and document comment blocks.
- Added settings option let user decide the tab-space for formatter's indentation.
- Added settings option to let user decide author name for file.

### Changed

- Syntax highlighting for template types, and inheritances
- Updated highlighting for function variables
- Updated document blocks to use specific doxygen commands (currently limited to @attention, @author, @bug, @brief, @copyright, @date, @deprecated, @details, @emoji, @example, @extends, @file, @package, @param, @return, @returns, @see, @short, @todo, @version)
- Updated auto-addition of "*" logic for comment start block

### Removed

- Dropped auto-closing for document block since

## [0.3.9] - 2025-01-31

### Added

- Added highlighting for document blocks and doxygen comments

### Changed

- Fixed issue where an unnecessary newline was being added before closing curly braces.
- Changed scopes for all keywords to enable syntax highlighting on different themes.
- Updated highlighting for scope resolution and inheritance operators.
- Updated logic to ignore operator formatting when it ends with semicolon. This fixes issues where it formatter wrongly formatter statement like `import myPackage_pkg::*;`

### Removed

- The built-in themes specific to this extension were dropped. This is to let user have the ability to use custom themes and still get good experience.

## [0.3.8] - 2025-01-16

### Changed

- Fixed the formatting of urls issue

## [0.3.7] - 2025-01-16

### Added

- Formatter now adds spaces after commas for cleaner look.
- Added command for adding/updating file header (Shortcut => Ctrl/Cmd+Shift+h)

### Changed

- Fixed a bug where the formatter adds a newline after a semicolon even if a comment block present immediately follows it.
- Updated auto-closing for block comments
- Updated formatter to skip adding newlines to closing curly braces when a semicolon is present after it, and to ignore extra newlines after the opening curly brace.
- Line comment formatter now ignores URLs

## [0.3.6] - 2025-01-15

### Changed

- Fixed an issue with the formatter where it didn't respect extra newlines and incorrectly added unnecessary newlines before closing curly braces.
- Updated highlighting for embedded languages.

## [0.3.5] - 2024-12-27

### Changed

- Updated highlighting for embedded languages.
- Updated themes
- Updated formatter to ignore extra newlines.

## [0.3.4] - 2024-12-27

### Added

- Highlighting for scope resolution operator ( :: )
- Highlighting for Template-types ( < > )
- Highlighting for derived types - inheritance ( x : y)
- Highlighting for embedded languages

## [0.3.3] - 2024-12-26

### Changed

- Formatter logic for brackets
- Re-organized the files in a proper structure

## [0.3.2] - 2024-12-24

### Added

- Highlighting for Standard packages
- Missing highlighting for some built-in functions

### Changed

- Code formatter logic - Improved the formatter
- Packaging structure and logic

## [0.3.1] - 2024-12-18

### Changed

- The Changelog now is in reverse chronological order, making it easy to track.
- Updated Parsing Logic for Comments - Now the parser parses document comments (the ones starting with **/\***).
- Other comments are directly parsed as is, preserving content. This now allows for the comments to be written in markdown and be interpreted the same.
- Pushed the hover logic as a subscription - it should let the hover logic work

## [0.3.0] - 2024-12-17

### Added

- Custom color highlighting for all types of keywords.
- Added Dark and Light Theme
- Added "hover for info" for displaying comment on functions, keywords, definitions etc. This is just a rudimentary implementation which displays basic info (to some extent).

### Changed

- Fixed issue with how comments were being interpreted.
- Modified the snippets to drop extra comments at end of declarations like components, structs etc.
- Modified the scopes of the different variables/keywords in the tmLanguage file

## [0.2.2] - 2024-12-10

### Added

- Added MIT License
- Highlighting for **_t** and **_e** objects - representing typedefs and enums respectively

## [0.2.1] - 2024-11-15

### Added

- Added Syntax Highlighting for built-in functions
- Added missing *chandle-type* `addr_handle_t`

### Changed

- Wrong date for release 0.2.0 in the Changelog

## [0.2.0] - 2024-11-15

### Added

- Implemented a simple language server (using LSP) * ***[Work in Progress]***
- Enhanced Auto-complete capabilities
- Added closing comments
- Added completion for built-in functions
- Made minor enhancements

## [0.1.0] - 2024-11-06

### Added

- Added language and syntax highlighting
