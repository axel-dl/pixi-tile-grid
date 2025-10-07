# PixiTileGrid Documentation

Complete documentation for the PixiTileGrid library.

## Getting Started

- **[Main README](../README.md)** - Quick start guide and basic usage

## Core Documentation

### [How It Works](./how-it-works.md)
Deep dive into the rendering engine architecture:
- Rendering pipeline explanation
- Layer system architecture
- Coordinate systems
- Scene graph structure
- Performance characteristics
- Design decisions

## API Reference

### Constructor

```typescript
new PixiTileGrid(options: TileGridOptions)
```

### TileGridOptions

```typescript
interface TileGridOptions {
  mapData: LayerDefinition[];
  spriteSheet: PIXI.Spritesheet;
  tileWidth: number;
  tileHeight: number;
  tileToIdTextureKey?: (tileIndex: number) => string;
  chunkSize?: number;        // default: 16
  cullingMargin?: number;    // default: 2
}
```

### LayerDefinition

```typescript
interface LayerDefinition {
  name: string;
  zIndex?: number;
  data: number[][];
}
```

## Examples

### Basic Usage

```typescript
import { PixiTileGrid } from 'pixi-tile-grid';

const tileGrid = new PixiTileGrid({
  mapData: [
    {
      name: 'ground',
      data: [[1, 2, 3], [4, 5, 6]]
    }
  ],
  spriteSheet: mySheet,
  tileWidth: 32,
  tileHeight: 32
});

app.stage.addChild(tileGrid);
```

### Multi-Layer

```typescript
const layers = [
  { name: 'background', zIndex: -10, data: [...] },
  { name: 'ground', zIndex: 0, data: [...] },
  { name: 'objects', zIndex: 5, data: [...] },
  { name: 'foreground', zIndex: 10, data: [...] }
];

const tileGrid = new PixiTileGrid({
  mapData: layers,
  spriteSheet: mySheet,
  tileWidth: 32,
  tileHeight: 32
});
```

### With Tile Mapping

```typescript
import { PixiTileGrid } from 'pixi-tile-grid';

const tileGrid = new PixiTileGrid({
  mapData: layers,
  spriteSheet: mySheet,
  tileWidth: 32,
  tileHeight: 32,
  tileToIdTextureKey: (index) => `tile_${index}`
});
```

## Architecture

```
PixiTileGrid (extends PIXI.Container)
  │
  ├─ Properties
  │   ├─ tileWidth: number (readonly)
  │   ├─ tileHeight: number (readonly)
  │   └─ _layers: Map<string, PIXI.Container> (private)
  │
  ├─ Constructor
  │   ├─ Validates options
  │   ├─ Stores configuration
  │   └─ Initializes layers
  │
  └─ Methods
      ├─ _initializeLayers() - Sort and create layer containers
      ├─ _renderLayer() - Loop through tile data
      └─ _createTileSprite() - Create individual sprites
```

## Project Philosophy

PixiTileGrid follows these principles:

1. **Single Responsibility** - Only renders tiles, nothing else
2. **Pure View Component** - No game logic or state management
3. **Composability** - Works with any game architecture
4. **Performance First** - Optimized for large tilemaps
5. **Type Safety** - Full TypeScript support
6. **Minimal API** - Easy to learn and use

## Contributing

See the main repository for contribution guidelines.

## License

CC0 1.0 Universal (Public Domain)
