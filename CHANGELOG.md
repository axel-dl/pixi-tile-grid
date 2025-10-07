# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-07

### Added

- Initial release of PixiTileGrid
- Core tile rendering functionality
- Multi-layer support with z-index ordering
- Custom tile-to-texture mapping function
- TypeScript support with full type definitions
- Configurable tile dimensions (tileWidth, tileHeight)
- Chunking and culling options (infrastructure for future optimization)
- Comprehensive test suite with 91.93% coverage
- Three distribution formats: ESM, CommonJS, and UMD
- Complete documentation and API reference
- Live demos with procedural and real spritesheet rendering

### Features

- Pure view component (no game logic)
- Extends PIXI.Container for seamless integration
- Supports any tile size and map dimensions
- Empty tile skipping (tile index 0)
- Layer-based rendering system
- Readonly configuration properties
- Helpful error messages and warnings

### Technical

- Built with TypeScript 5.9 (strict mode)
- Uses Vite for fast builds
- Jest for unit testing with mocked PixiJS
- Minimal bundle size (<3KB gzipped)
- PixiJS v8.13.2 as peer dependency

[1.0.0]: https://github.com/axel-dl/pixi-tile-grid/releases/tag/v1.0.0
