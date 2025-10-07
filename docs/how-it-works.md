# How the Rendering Engine Works

This document explains the internal architecture and rendering pipeline of PixiTileGrid.

## Architecture Overview

PixiTileGrid follows a **pure view component** design pattern. It has zero game logic and focuses exclusively on transforming tile data into visual sprites.

```text
Input (Data)  →  PixiTileGrid (View)  →  Output (Visuals)
```

## Rendering Pipeline

### 1. Initialization Phase

When you create a `new PixiTileGrid(options)`, the constructor executes this sequence:

```text
Constructor
  ├─ Validate options (throw errors if invalid)
  ├─ Store configuration (tileWidth, tileHeight, etc.)
  └─ Call _initializeLayers()
```

**Note (async initialization):** If your workflow requires loading or generating a spritesheet (for example using `PIXI.Assets.load()` or creating a programmatic spritesheet via Canvas), that step is asynchronous. In those cases wrap grid creation in an async initialization sequence and only add the grid to the stage after the spritesheet is ready.

See `docs/PROGRAMMATIC_SPRITESHEET.md` for a helper that generates a spritesheet at runtime.

### 2. Layer Initialization (`_initializeLayers`)

This method orchestrates the entire rendering process:

 
### Step 1: Sort Layers by zIndex

```typescript
const sortedLayers = [...mapData].sort((a, b) => {
  return (a.zIndex ?? 0) - (b.zIndex ?? 0);
});
```

Why? Lower zIndex values must be added first to appear behind higher values.

### Step 2: Loop Through Each Layer

For each layer definition:

```text
1. Create empty PIXI.Container
2. Set container.label (for debugging)
3. Set container.zIndex
4. Store in _layers Map by name
5. Call _renderLayer() to fill it with sprites
6. Add container to main PixiTileGrid
```

 
### Step 3: Enable zIndex Sorting

```typescript
this.sortableChildren = true;
```

This tells PixiJS to respect zIndex values when rendering.

### 3. Layer Rendering (`_renderLayer`)

This method transforms a 2D data array into positioned sprites:

```text
Input: LayerDefinition { name: "ground", data: [[1,2],[3,4]] }
       Container (empty)

Process:
  for each row:
    for each column:
      ├─ Get tile index from data[row][col]
      ├─ Skip if index is 0 (empty tile)
      ├─ Call _createTileSprite(index, col, row)
      └─ Add resulting sprite to container

Output: Container filled with positioned sprites
```

### 4. Sprite Creation (`_createTileSprite`)

This is where tile indices become visual sprites:

```text
Input: tileIndex=5, col=2, row=1

Step 1: Map index to texture key
  ├─ If tileToIdTextureKey provided: call it
  └─ Else: convert to string

Step 2: Lookup texture in spritesheet
  texture = spriteSheet.textures[key]

Step 3: Validate texture exists
  ├─ If not found: warn and return null
  └─ Continue if found

Step 4: Create and configure sprite
  ├─ sprite = new PIXI.Sprite(texture)
  ├─ sprite.x = col * tileWidth
  ├─ sprite.y = row * tileHeight
  ├─ sprite.width = tileWidth
  ├─ sprite.height = tileHeight
  └─ return sprite

Output: Positioned sprite or null
```

## Coordinate Systems

### Grid Coordinates

The `data` array uses row/column indices:

```text
data[row][col]
data[0][0] = top-left
data[0][1] = one cell to the right
data[1][0] = one cell down
```

### World Coordinates

Sprites are positioned in pixel space:

```text
x = col * tileWidth
y = row * tileHeight
```


Example with 32x32 tiles:
```text
Grid [0][0] → World (0, 0)
Grid [1][0] → World (32, 0)
Grid [0][1] → World (0, 32)
Grid [2][3] → World (96, 64)
```

## Scene Graph Structure

The final PixiJS scene graph looks like this:

```text
PixiTileGrid (PIXI.Container)
  │
  ├─ Container (Layer: "background", zIndex: -10)
  │    ├─ Sprite (tile at 0,0)
  │    ├─ Sprite (tile at 1,0)
  │    └─ ...
  │
  ├─ Container (Layer: "ground", zIndex: 0)
  │    ├─ Sprite (tile at 0,0)
  │    ├─ Sprite (tile at 1,0)
  │    └─ ...
  │
  └─ Container (Layer: "foreground", zIndex: 10)
       ├─ Sprite (tile at 0,0)
       └─ ...
```

## Layer System Deep Dive

### Why Separate Containers?

Each layer gets its own container for several reasons:

1. **Organizational clarity** - Easy to identify layers in PixiJS DevTools
2. **Batch operations** - Can hide/show/move entire layers at once
3. **Memory efficiency** - PixiJS can optimize rendering per container
4. **Future features** - Enables per-layer culling and chunking

### The `_layers` Map

```typescript
private _layers: Map<string, PIXI.Container>
```

This stores references to layer containers by name:

```typescript
_layers.get("ground")  // Returns the ground layer container
_layers.get("trees")   // Returns the trees layer container
```

**Purpose:** Allows future API methods to access/manipulate specific layers.

## Empty Tiles (Index 0)

By convention, tile index `0` means "no tile here":

```typescript
if (tileIndex === 0 || tileIndex === undefined) {
    continue; // Skip creating sprite
}
```

This allows sparse maps:

```typescript
data: [
  [1, 0, 0, 2],  // Only tiles at [0,0] and [0,3]
  [0, 3, 0, 0]   // Only tile at [1,1]
]
```

## Error Handling

### Constructor Validation

The constructor throws errors for invalid configuration:

```typescript
throw new Error("PixiTileGrid: mapData is required");
throw new Error("tileWidth must be positive");
```

**Why throw?** Fail-fast principle - catch configuration errors immediately.

### Missing Textures

Missing textures produce warnings, not errors:

```typescript
console.warn(`Texture not found for key "${textureKey}"`);
return null; // Graceful degradation
```

**Why warn?** One missing texture shouldn't break the entire map.

## Performance Characteristics

### Current Implementation

- **Initialization:** O(n) where n = total number of tiles across all layers
- **Memory:** One sprite per non-empty tile
- **Rendering:** All sprites always rendered (no culling yet)

### Future Optimizations (Planned)

- **Chunking:** Divide map into chunks for partial updates
- **Culling:** Only render visible chunks
- **Texture batching:** Group tiles by texture for GPU efficiency

## Data Flow Summary

```text
User provides TileGridOptions
  ↓
Constructor validates
  ↓
_initializeLayers() sorts layers
  ↓
For each layer:
  ↓
_renderLayer() loops through data
  ↓
For each tile:
  ↓
_createTileSprite() creates sprite
  ↓
Sprite added to layer container
  ↓
Layer container added to main grid
  ↓
PixiJS renders the scene graph
  ↓
User sees tiles on screen
```

## Key Design Decisions

### Why Extend PIXI.Container?

Allows PixiTileGrid to be used like any PixiJS display object:

```typescript
app.stage.addChild(tileGrid);  // Just works
tileGrid.x = 100;              // Move the entire grid
tileGrid.visible = false;      // Hide it
```

### Why Private Methods?

Implementation details (`_renderLayer`, `_createTileSprite`) are hidden to:

1. Prevent misuse
2. Allow internal refactoring
3. Keep public API minimal

### Why No Game Logic?

Following single-responsibility principle:

- ✅ Renders tiles efficiently
- ❌ No collision detection
- ❌ No entity management
- ❌ No input handling
- ❌ No animation logic

This keeps the library focused and composable with any game architecture.

## Related Documentation

- [Tile Mapping Helpers](./tile-mappers.md) - Helper functions for texture mapping
- [API Reference](./api-reference.md) - Complete API documentation
