# PixiTileGrid - Complete Development Guide

> Understanding the project from concept to completion

## Table of Contents

1. [Project Genesis](#project-genesis)
2. [Architecture Overview](#architecture-overview)
3. [Development Timeline](#development-timeline)
4. [Technical Deep Dive](#technical-deep-dive)
5. [Testing Strategy](#testing-strategy)
6. [Build & Distribution](#build--distribution)
7. [Lessons Learned](#lessons-learned)
8. [Future Roadmap](#future-roadmap)

---

## Project Genesis

### The Problem

Modern web-based games and map editors need efficient ways to render large, grid-based tile maps. While PixiJS provides excellent low-level rendering capabilities, developers repeatedly implement the same tile grid patterns, often with:

- Mixed responsibilities (rendering + game logic)
- Poor performance for large maps
- Lack of layer support
- No TypeScript typing
- Limited reusability

### The Solution

PixiTileGrid solves this by providing a **focused, reusable, well-tested library** that handles tile rendering and nothing else. It's designed to be:

1. **Composable** - Fits into any game architecture
2. **Performant** - Designed for large maps (with future optimizations)
3. **Type-Safe** - Full TypeScript support
4. **Well-Documented** - Clear API and examples
5. **Production-Ready** - Tested, built, and distributable

---

## Architecture Overview

### Design Principles

#### 1. Single Responsibility Principle (SRP)

**Responsibility**: Render tiles from 2D array data to PixiJS sprites

**NOT Responsible For**:
- Game state management
- Collision detection
- Input handling
- Physics
- Entity systems
- Animation logic

**Why This Matters**:
```
❌ Bad: TileGrid that also handles player movement, collision, pickups
✅ Good: TileGrid that ONLY renders. Game logic lives elsewhere.
```

This separation makes the code:
- Easier to test (mock game logic away)
- Easier to maintain (changes don't cascade)
- More reusable (works with any game architecture)

#### 2. View-Model Separation

```
User's Game                    PixiTileGrid
┌─────────────┐               ┌──────────────┐
│ Game State  │──mapData[][]──▶│  Rendering   │
│  (Model)    │◀──events──────│   (View)     │
└─────────────┘               └──────────────┘
```

- **User owns the data** (`number[][]` arrays)
- **Library owns the presentation** (PixiJS sprites)
- Changes to data trigger re-rendering
- No hidden state in the library

#### 3. Composition Over Inheritance

```typescript
class PixiTileGrid extends PIXI.Container {
  // Extends Container to BE a PixiJS display object
  // Can be added to any PixiJS scene graph
  // Works with existing PixiJS features (filters, masks, etc.)
}
```

By extending `PIXI.Container`, PixiTileGrid becomes a first-class PixiJS citizen.

### Core Data Structures

#### LayerDefinition

```typescript
interface LayerDefinition {
    name: string;              // Identifier for debugging
    zIndex?: number;           // Render order (higher = front)
    data: number[][];          // 2D array of tile indices
}
```

**Design Decision**: Keep it simple
- `name` for debugging/logging
- `zIndex` for flexible layering
- `data` as plain 2D array (no complex wrapper)

#### TileGridOptions

```typescript
interface TileGridOptions {
    mapData: LayerDefinition[];                          // Required: layer definitions
    spriteSheet: PIXI.Spritesheet;                      // Required: texture source
    tileWidth: number;                                  // Required: tile size
    tileHeight: number;                                 // Required: tile size
    tileToIdTextureKey?: (tileIndex: number) => string; // Optional: custom mapping
    chunkSize?: number;                                 // Optional: future optimization
    cullingMargin?: number;                             // Optional: future optimization
}
```

**Design Decisions**:
- Required options have no defaults (fail fast if missing)
- Optional options have sensible defaults (16 for chunkSize, 2 for margin)
- Tile mapping function is optional (defaults to `toString()`)

---

## Development Timeline

### Phase 1: Planning & API Design (Day 1)

**Goal**: Define clear scope and API surface

**Activities**:
1. Research PixiJS v8 changes
2. Define interfaces (`LayerDefinition`, `TileGridOptions`)
3. Sketch core methods (`_initializeLayers`, `_renderLayer`, `_createTileSprite`)
4. Document non-goals (what NOT to include)

**Output**:
- TypeScript interfaces
- Method signatures
- README outline

**Key Learning**: API design first prevents scope creep

### Phase 2: Core Implementation (Day 1-2)

**Goal**: Get basic rendering working

**Implementation Order**:
1. ✅ Constructor validation
2. ✅ Layer creation and sorting
3. ✅ Tile sprite generation
4. ✅ Positioning and sizing
5. ✅ Texture mapping

**Code Walkthrough**:

```typescript
// 1. Constructor validates inputs
constructor(options: TileGridOptions) {
    super(); // Call PIXI.Container constructor
    
    // Fail fast with clear error messages
    if (!options.mapData || options.mapData.length === 0) {
        throw new Error('mapData is required and must contain at least one layer');
    }
    // ... more validation
    
    this._options = options;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    this._chunkSize = options.chunkSize ?? 16;
    this._cullingMargin = options.cullingMargin ?? 2;
    
    this._initializeLayers(); // Kick off rendering
}
```

```typescript
// 2. Initialize layers with sorting
private _initializeLayers(): void {
    // Sort layers by zIndex (lower = back, higher = front)
    const sortedLayers = [...this._options.mapData].sort((a, b) => {
        const aZ = a.zIndex || 0;
        const bZ = b.zIndex || 0;
        return aZ - bZ;
    });

    // Create a Container for each layer
    for (const layerDef of sortedLayers) {
        const container = new PIXI.Container();
        container.label = `Layer: ${layerDef.name}`;
        container.zIndex = layerDef.zIndex || 0;
        
        this._layers.set(layerDef.name, container);
        this._renderLayer(container, layerDef);
        this.addChild(container);
    }
    
    this.sortableChildren = true; // Enable z-index sorting
}
```

```typescript
// 3. Render tiles in a layer
private _renderLayer(container: PIXI.Container, layerDef: LayerDefinition): void {
    const { data } = layerDef;
    
    if (!data || data.length === 0) {
        console.warn(`Layer "${layerDef.name}" has no tile data`);
        return;
    }

    const rows = data.length;
    
    for (let row = 0; row < rows; row++) {
        const cols = data[row].length;
        for (let col = 0; col < cols; col++) {
            const tileIndex = data[row][col];
            
            // Skip empty tiles (0 = no tile)
            if (tileIndex === 0) continue;
            
            const sprite = this._createTileSprite(tileIndex, col, row);
            if (sprite) {
                container.addChild(sprite);
            }
        }
    }
}
```

```typescript
// 4. Create a single tile sprite
private _createTileSprite(tileIndex: number, col: number, row: number): PIXI.Sprite | null {
    // Map tile index to texture key
    const tileToIdTextureKey = this._options.tileToIdTextureKey || ((index) => index.toString());
    const textureKey = tileToIdTextureKey(tileIndex);
    
    // Get texture from spritesheet
    const texture = this._options.spriteSheet.textures[textureKey];
    
    if (!texture) {
        console.warn(`Texture not found for key "${textureKey}" (tile index: ${tileIndex})`);
        return null;
    }
    
    // Create sprite
    const sprite = new PIXI.Sprite(texture);
    sprite.x = col * this.tileWidth;
    sprite.y = row * this.tileHeight;
    sprite.width = this.tileWidth;
    sprite.height = this.tileHeight;
    
    return sprite;
}
```

**Key Decisions**:
- Private methods with `_` prefix (Node.js convention)
- Early returns for invalid data (fail fast)
- Helpful console warnings (developer experience)
- Position sprites in grid coordinates (simple math)

### Phase 3: Testing (Day 2)

**Goal**: Achieve >90% test coverage

**Challenges**:
1. Jest doesn't run in browser (no WebGL)
2. PixiJS has browser dependencies
3. Need to test logic without actual rendering

**Solution**: Mock PixiJS classes

```typescript
// tests/__mocks__/pixi.js.ts
export class Texture {
  constructor() {}
}

export class Sprite {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  texture: Texture;

  constructor(texture: Texture) {
    this.texture = texture;
  }
}

export class Container {
  children: any[] = [];
  label?: string;
  zIndex: number = 0;
  sortableChildren: boolean = false;

  addChild(child: any): any {
    this.children.push(child);
    return child;
  }
}
```

**Test Categories**:
1. Constructor validation (error cases)
2. Default values (optional parameters)
3. Layer creation (containers, sorting)
4. Tile rendering (positioning, sizing)
5. Tile mapping (custom functions)

**Result**: 16 tests, 91.93% coverage

### Phase 4: Documentation (Day 2-3)

**Goal**: Make the library understandable and usable

**Documentation Created**:
1. **README.md** - Quick start, API reference, examples
2. **docs/how-it-works.md** - Architecture deep dive
3. **docs/README.md** - Documentation index
4. **docs/PORTFOLIO_GUIDE.md** - Interview preparation
5. **docs/DEVELOPMENT_GUIDE.md** - This file

**Philosophy**: Documentation is code

### Phase 5: Build & Distribution (Day 3)

**Goal**: Make library distributable

**Build Setup**:
1. Vite configured for library mode
2. Three output formats (ESM, CJS, UMD)
3. TypeScript declarations generated
4. Source maps for debugging
5. External PixiJS dependency

**Build Output**:
```
dist/
├── pixi-tile-grid.es.js       # 2.28 KB (modern)
├── pixi-tile-grid.cjs.js      # 2.13 KB (Node)
├── pixi-tile-grid.umd.js      # 2.34 KB (browser)
├── index.d.ts                 # TypeScript declarations
└── *.map                      # Source maps
```

### Phase 6: Live Demo (Day 3)

**Goal**: Prove it works with real rendering

**Demo Features**:
- Real PixiJS v8 integration
- Procedurally generated tiles
- Multi-layer rendering
- Random decorations
- Visual verification

**Technical Challenge**: UMD module loading
**Solution**: Copy built file to demo folder, access via `window.PixiTileGrid.PixiTileGrid`

---

## Technical Deep Dive

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,                    // Enable all strict checks
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Why Strict Mode?**
- Catches bugs at compile time
- Forces explicit typing
- Prevents null/undefined errors
- Makes refactoring safer

### Build Configuration (Vite)

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PixiTileGrid',
      fileName: (format) => `pixi-tile-grid.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['pixi.js'],  // Don't bundle PixiJS
      output: {
        globals: {
          'pixi.js': 'PIXI'    // Use global PIXI in UMD
        }
      }
    }
  }
});
```

**Why External PixiJS?**
- Users manage their own PixiJS version
- Prevents bundle bloat (PixiJS is ~500KB)
- Avoids version conflicts
- Smaller library size

---

## Testing Strategy

### Test Philosophy

**Test Behavior, Not Implementation**

```typescript
// ❌ Bad: Testing implementation details
it('should call _createTileSprite 4 times', () => {
  const spy = jest.spyOn(grid, '_createTileSprite');
  // ...
  expect(spy).toHaveBeenCalledTimes(4);
});

// ✅ Good: Testing observable behavior
it('should create 4 sprites for 2x2 grid', () => {
  const grid = new PixiTileGrid({ /* 2x2 map */ });
  const layer = grid.children[0];
  expect(layer.children.length).toBe(4);
});
```

### Mocking Strategy

**Mock External Dependencies, Not Internal Logic**

- PixiJS classes are mocked (external dependency)
- PixiTileGrid logic is NOT mocked (what we're testing)
- Test doubles match real API surface

### Coverage Analysis

**91.93% Coverage** is excellent because:
- All critical paths are tested
- Edge cases are covered
- Error handling is validated

**Uncovered Lines** (8.07%):
- Warning messages for rare edge cases
- Defensive code that's good to have
- Not critical for MVP functionality

---

## Build & Distribution

### Package Structure

```
pixi-tile-grid/
├── src/
│   ├── index.ts              # Public API exports
│   └── PixiTileGrid.ts       # Main implementation
├── dist/                      # Built files (git-ignored)
├── tests/                     # Unit tests
├── docs/                      # Documentation
├── demo/                      # Live examples
├── package.json              # Package metadata
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Build config
├── jest.config.js            # Test config
└── README.md                 # Main documentation
```

### Module Formats Explained

**ESM (ES Modules)**
```javascript
// Modern import/export syntax
import { PixiTileGrid } from 'pixi-tile-grid';
```
- Used by: Vite, Webpack 5+, modern browsers
- Benefits: Tree-shaking, static analysis, future-proof

**CommonJS**
```javascript
// Traditional Node.js syntax
const { PixiTileGrid } = require('pixi-tile-grid');
```
- Used by: Older Node.js, Jest, some bundlers
- Benefits: Broad compatibility

**UMD (Universal Module Definition)**
```html
<!-- Browser script tag -->
<script src="pixi-tile-grid.umd.js"></script>
<script>
  const grid = new window.PixiTileGrid.PixiTileGrid(options);
</script>
```
- Used by: Direct browser inclusion
- Benefits: No build step required

---

## Lessons Learned

### What Went Well

1. **API-First Design**: Defining interfaces before implementation prevented scope creep
2. **Focused Scope**: Single responsibility made testing and maintenance easier
3. **TypeScript Strict Mode**: Caught bugs before they reached tests
4. **Comprehensive Testing**: 91% coverage gives confidence for refactoring
5. **Documentation-Driven**: Writing docs clarified design decisions

### Challenges Overcome

1. **Jest + PixiJS**: ESM modules don't work in Jest/Node
   - **Solution**: Created comprehensive mocks
   - **Learning**: Understand module systems deeply

2. **UMD Export Structure**: Module namespace vs direct export
   - **Solution**: Flexible accessor with fallback
   - **Learning**: Vite's UMD behavior with named exports

3. **Event System Errors**: PixiJS event system incompatibility
   - **Solution**: Disable events with `eventMode: 'none'`
   - **Learning**: Version compatibility matters

### What I'd Do Differently

1. **Earlier Live Demo**: Would have caught UMD issues sooner
2. **Benchmark from Start**: Track performance metrics as features are added
3. **More Examples**: Different use cases (isometric, hexagonal, animated)
4. **CI/CD Setup**: Automated testing on push
5. **Semantic Versioning**: Follow semver strictly from v0.1.0

---

## Future Roadmap

### Performance Optimizations (v1.1.0)

**Chunking System**
```typescript
// Divide map into 16x16 chunks
// Only render visible chunks
const visibleChunks = calculateVisibleChunks(viewport);
renderChunks(visibleChunks);
```

**Benefits**:
- 10-100x faster for large maps
- Lower memory usage
- Smoother scrolling

**Culling Implementation**
```typescript
// Only render tiles in viewport + margin
const margin = this._cullingMargin * this.tileWidth;
const visibleBounds = viewport.getBounds().pad(margin);
```

### Feature Additions (v1.2.0)

1. **Animated Tiles**: Support for tile animations
2. **Dynamic Layers**: Add/remove layers at runtime
3. **Tile Effects**: Rotation, flipping, tinting
4. **Hexagonal Grids**: Support for hex-based games
5. **Isometric Rendering**: 2.5D perspective

### Developer Experience (v1.3.0)

1. **React Wrapper**: `<TileGrid>` component
2. **Vue Wrapper**: Vue 3 composition API
3. **Visual Editor**: Browser-based tile map editor
4. **Interactive Docs**: Runnable code examples
5. **Performance Profiler**: Built-in performance monitoring

---

## Conclusion

PixiTileGrid demonstrates professional software development:

- ✅ Clean architecture (SRP, separation of concerns)
- ✅ Comprehensive testing (91% coverage, mocked dependencies)
- ✅ Modern tooling (TypeScript, Vite, Jest, pnpm)
- ✅ Complete documentation (API, architecture, portfolio guide)
- ✅ Production-ready (built, tested, distributable)

It's more than just a library - it's a showcase of software engineering best practices.

---

*Last Updated: October 2025*
*Author: Your Name*
*Repository: github.com/axel-dl/pixi-tile-grid*
