# PixiTileGrid

> A high-performance, single-responsibility tile rendering library for PixiJS v8

[![npm version](https://badge.fury.io/js/pixi-tile-grid.svg)](https://www.npmjs.com/package/pixi-tile-grid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-91.93%25-brightgreen.svg)](https://github.com/axel-dl/pixi-tile-grid)

## Overview

PixiTileGrid is a **pure "View" component** that efficiently visualizes grid-based tile data with PixiJS v8. It follows the single-responsibility principle: it renders tiles, and only tiles. No game logic, no collision detection, no state management - just fast, reliable tile rendering.

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

const tileGrid = new PixiTileGrid({
  mapData: layers,
  spriteSheet: yourPixiSpritesheet,
  tileWidth: 32,
  tileHeight: 32,
  tileToIdTextureKey: (index) => `tile_${index}` // 1 → "tile_1"
});

app.stage.addChild(tileGrid);
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
-  **[Full Documentation](./docs/README.md)** - All docs in one place

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

CC0 1.0 Universal (Public Domain)

## Contributing

Contributions welcome! Please ensure:
- All tests pass
- Code follows TypeScript strict mode
- Changes maintain single-responsibility focus
- New features include tests

## Related

- [PixiJS](https://pixijs.com/) - 2D WebGL renderer
- Examples repository (coming soon)
