# Change Log

## Unreleased

### Changed

- Updated doxygen syntax highlighting to include *details* command

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
