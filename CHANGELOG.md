# Change Log

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
