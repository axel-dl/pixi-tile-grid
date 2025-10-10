# PixiTileGrid

> A high-performance, single-responsibility tile rendering library for PixiJS v8

[![npm version](https://badge.fury.io/js/pixi-tile-grid.svg)](https://www.npmjs.com/package/pixi-tile-grid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-91.93%25-brightgreen.svg)](https://github.com/axel-dl/pixi-tile-grid)

## Overview

PixiTileGrid is a **pure "View" component** that efficiently visualizes grid-based tile data with PixiJS v8. It is a spritesheet-driven renderer: you provide tile indices (map data) and a PIXI.Spritesheet (or a programmatically-generated spritesheet) and PixiTileGrid maps each index to a texture and renders sprites. It follows the single-responsibility principle: it renders tiles, and only tiles. No game logic, no collision detection, no state management - just fast, reliable tile rendering.

### Why PixiTileGrid?

- 🎯 **Focused**: Does one thing exceptionally well - renders tiles
- 🚀 **Fast**: Designed for performance with chunking/culling support
- 📚 **Layered**: Stack multiple tile layers with z-index control
- 🎨 **Flexible**: Custom tile-to-texture mapping
- 🔒 **Type-Safe**: Full TypeScript support with strict mode
- ✅ **Tested**: 91%+ test coverage
- 📦 **Tiny**: <3KB gzipped, tree-shakeable

## Installation

```bash
# Using pnpm (recommended)
pnpm add pixi-tile-grid pixi.js

# Using npm
npm install pixi-tile-grid pixi.js

# Using yarn
yarn add pixi-tile-grid pixi.js
```

> **Note**: PixiJS v8 is a peer dependency and must be installed separately.

## Quick Start

```typescript
import { PixiTileGrid } from 'pixi-tile-grid';
import * as PIXI from 'pixi.js';

// NOTE: PixiTileGrid is spritesheet-driven. Load or generate a spritesheet first (async)
// Example uses PixiJS Assets for loading a prepared spritesheet JSON + image.

const layers = [
  {
    name: 'ground',
    zIndex: 0,
    data: [
      [1, 1, 2, 2],
      [1, 1, 2, 2],
      [3, 3, 4, 4]
    ]
  }
];
// Async initialization pattern (recommended)
async function createGrid(app) {
  // load a spritesheet or create one programmatically
  const spritesheet = await PIXI.Assets.load('path/to/tilesheet.json');

  const tileGrid = new PixiTileGrid({
    mapData: layers,
    spriteSheet: spritesheet,
    tileWidth: 32,
    tileHeight: 32,
    // map numbers in your data to frame keys in the spritesheet
    tileToIdTextureKey: (index) => (index === 0 ? null : `tile_${index}`)
  });

  app.stage.addChild(tileGrid);
}
```

## Tile Mapping

The `tileToIdTextureKey` function converts tile indices to texture names:

```typescript
// Simple prefix pattern
tileToIdTextureKey: (index) => `tile_${index}`

// Zero-padded numbers
tileToIdTextureKey: (index) => `tile_${index.toString().padStart(3, '0')}`

// Named tiles with lookup
const mapping = { 1: 'grass', 2: 'dirt', 3: 'stone' };
tileToIdTextureKey: (index) => mapping[index] || `tile_${index}`

// Custom logic
tileToIdTextureKey: (index) => {
  if (index < 10) return `ground_${index}`;
  if (index < 20) return `wall_${index}`;
  return `misc_${index}`;
}
```

See also: docs/PROGRAMMATIC_SPRITESHEET.md for an example that generates a spritesheet programmatically when you don't have image assets.

## API

### Constructor Options

```typescript
interface TileGridOptions {
  mapData: LayerDefinition[];      // Your tile layers
  spriteSheet: PIXI.Spritesheet;   // PixiJS spritesheet
  tileWidth: number;                // Tile width in pixels
  tileHeight: number;               // Tile height in pixels
  tileToIdTextureKey?: (index: number) => string;  // Optional mapper
  chunkSize?: number;               // Default: 16
  cullingMargin?: number;           // Default: 2
}

interface LayerDefinition {
  name: string;        // Layer identifier
  zIndex?: number;     // Draw order (lower = behind)
  data: number[][];    // 2D array of tile indices
}
```

## Documentation

- 📖 **[How It Works](./docs/how-it-works.md)** - Rendering engine deep dive
- **[Full Documentation](./docs/README.md)** - All docs in one place

## Package & npm

PixiTileGrid is published to npm as `pixi-tile-grid` (package.json: name & version). Key points for consumers and maintainers:

- Package name: `pixi-tile-grid`
- Version: see `package.json` (this repository's source-of-truth)
- License: MIT
- Peer dependency: `pixi.js` (v8.x) — consumers must install PixiJS separately
- Distributed files: the build outputs live in `dist/` and are the published artifacts (ESM, CJS, types).

Import examples:

```ts
// ESM - default import (recommended for simplicity)
import PixiTileGrid from 'pixi-tile-grid';

// ESM - named import (also supported)
import { PixiTileGrid as NamedPixiTileGrid } from 'pixi-tile-grid';

// CommonJS - default (some bundlers expose the default on `require(...).default`)
const PixiTileGrid = require('pixi-tile-grid').default || require('pixi-tile-grid');

// CommonJS - named
const { PixiTileGrid } = require('pixi-tile-grid');
```

Publishing (maintainers)

1. Update `package.json` version and `CHANGELOG.md` as appropriate.
1. Build the library and verify types:

```bash
pnpm install; pnpm build
```

1. Run tests and coverage locally:

```bash
pnpm test; pnpm test:coverage
```

1. Publish to npm (public):

```bash
npm publish --access public
```

1. Tag the release in git and push tags:

```bash
git tag vX.Y.Z; git push --tags
```

For a complete, maintainers-only checklist and extra notes (publishing files, npm ignore, changelog formatting), see `internal/PUBLISHING.md`.

Release helper script

We provide a small helper to release a new version locally (bump version, build, publish, push tags):

```bash
node ./scripts/release.cjs patch
```

You can replace `patch` with `minor`, `major`, or a specific semver (e.g. `1.2.3`).

## Architecture

PixiTileGrid follows these principles:

- **Single Responsibility** - Only renders tiles
- **Pure View Component** - No game logic or state
- **Composable** - Works with any game architecture
- **Performance First** - Optimized for large maps

### What It Does ✅

- Renders tile sprites efficiently
- Manages multiple z-indexed layers
- Maps tile indices to textures
- Positions sprites in world space

### What It Doesn't Do ❌

- Game logic or collision detection
- Entity management
- Input handling
- Animation systems
- Physics calculations

## Examples

### Multi-Layer Map

```typescript
const layers = [
  { name: 'background', zIndex: -10, data: [[...]] },
  { name: 'ground', zIndex: 0, data: [[...]] },
  { name: 'objects', zIndex: 5, data: [[...]] },
  { name: 'foreground', zIndex: 10, data: [[...]] }
];

const tileGrid = new PixiTileGrid({
  mapData: layers,
  spriteSheet: mySheet,
  tileWidth: 32,
  tileHeight: 32
});
```

### Custom Tile Mapping

```typescript
const tileGrid = new PixiTileGrid({
  mapData: layers,
  spriteSheet: mySheet,
  tileWidth: 32,
  tileHeight: 32,
  tileToIdTextureKey: (index) => {
    if (index < 10) return `ground_${index}`;
    if (index < 20) return `wall_${index}`;
    return `misc_${index}`;
  }
});
```

## Requirements

- PixiJS v8.x
- TypeScript 5.x (if using TypeScript)

## Development

```bash
# Install dependencies
pnpm install

# Build library
pnpm build

# Run tests
pnpm test
```

## License

MIT

## Contributing

Contributions welcome! Please ensure:

- All tests pass
- Code follows TypeScript strict mode
- Changes maintain single-responsibility focus
- New features include tests

## Related

- [PixiJS](https://pixijs.com/) - 2D WebGL renderer
- Examples repository (coming soon)
