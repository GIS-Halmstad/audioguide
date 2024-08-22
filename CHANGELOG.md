<!-- markdownlint-disable MD024 - because we want to duplicate headings, such as Added or Fixed.-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Service Worker, created by Workbox. It precaches most of the assets, except the really big ones. Two areas of improvement are: a) let user control which guide(s) will be pre-cached for offline viewing, and b) pre-cache the relevant background maps from the WMS service as well. Unless these are added, the app will not work offline. But see this commit as a starting point.

## [1.3.0] - 2024-08-13

### Added

- It is now possible to load audioguide features that come in different projection than that of the map. It's useful e.g. when using OpenStreetMap in its native EPSG:3857, while the features created locally may come in another projection. See commit info in 08a3d3dbcbd081f5a5e2900a9e72a83364d99990 for details.

## [1.2.4] - 2024-08-12

### Security

- Upgraded dependencies to latest versions.

## [1.2.3] - 2024-06-25

### Fixed

- Ensure that click on photo list/list will scroll up to the top of the List view. Commit: e42896b8defa74c23b0c96731bf225fc01f7cee2

### Security

- Upgraded dependencies to latest versions.

## [1.2.2] - 2024-06-13

### Fixed

- Prevent possible crash if the pre-selected guide's category wasn't selected. The current solution is to always select all available categories _if_ a guide is to be pre-selected. Commit: f6f5e4467b62f5f8b50b1c5de5ed66b3eab370ea.

## [1.2.1] - 2024-06-04

### Changed

- Some more tweaks to the translations.

## [1.2.0] - 2024-06-03

### BREAKING

- Substantial changes to the underlying database structure due to addition of internationalization support.

### Added

- The app is not internationalized. See the [README](https://github.com/GIS-Halmstad/audioguide/blob/main/README.md#internationalization-i18n) for more details. Merge commit: 08c7307e531a4205d2f356b10d41903b28cd0d8c.
- Cookie notice and Privacy policy popup. Commit: 13c0b80722659aa0ec55cea42b9ed75ca95b5255.

## [1.1.0] - 2024-05-13

### Added

- Added this CHANGELOG.

### Changed

- Added the combined `guideIdStopNumber` data point to certain events in statistics tracking. Refer to [the README](https://github.com/GIS-Halmstad/audioguide/blob/main/README.md#statistics) for more details. [f785742](https://github.com/GIS-Halmstad/audioguide/commit/f7857427be2d69a77d6863cf58d2aae78a82abc7).
- Improved clarity in the _Install as an app/add to home screen_ view description.
- Added an optional `a` query parameter. It allows linking directly into the active state of a guide, bypassing the preview state. [ff8aa58](https://github.com/GIS-Halmstad/audioguide/commit/ff8aa58).

## [1.0.0] - 2024-05-02

- Initial public release.

[unreleased]: https://github.com/GIS-Halmstad/audioguide/compare/v1.2.4...main
[1.3.0]: https://github.com/GIS-Halmstad/audioguide/compare/v1.2.4...v1.3.0
[1.2.4]: https://github.com/GIS-Halmstad/audioguide/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/GIS-Halmstad/audioguide/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/GIS-Halmstad/audioguide/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/GIS-Halmstad/audioguide/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/GIS-Halmstad/audioguide/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/GIS-Halmstad/audioguide/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/GIS-Halmstad/audioguide/releases/tag/v1.0.0

---

## Editor's help

Types of changes:

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.
