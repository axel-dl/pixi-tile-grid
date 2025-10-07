# PixieTileGrid - AI Coding Agent Instructions

## Project Overview
PixieTileGrid is a high-performance, single-responsibility tile rendering library for PixiJS v8. This is a **pure "View" component** - it only handles visualization of grid-based tile data with no game logic, state management, or entity systems.

## Architecture Philosophy
- **Single Responsibility**: Only renders tiles efficiently. Does NOT handle game logic, collision detection, entity management, or input handling
- **View Layer Only**: Consumers manage their own tile data (`number[][]`), and we just display it
- **Performance-First**: Uses chunking and culling strategies for large tile maps

## Core Concepts

### Layer System
- `LayerDefinition`: Defines a single tile layer with `name`, optional `zIndex`, and `data` (2D array of tile indices)
- Multiple layers can be stacked (e.g., ground layer, decoration layer, foreground)
- Each layer's `data` is a `number[][]` where each number is a tile index into the spritesheet

### Tile Mapping
- `tileToIdTextureKey`: Optional function that maps tile index numbers to texture names in the spritesheet
- If not provided, direct numeric indices are used
- Example: `tileToIdTextureKey: (index) => 'tile_${index}'`

### Performance Features (Planned)
- **Chunking**: Split large maps into chunks (default 16x16 tiles) for efficient updates
- **Culling**: Only render visible chunks with configurable margin (default 2 tile margin)
- Both `chunkSize` and `cullingMargin` are configurable via `TileGridOptions`

## Tech Stack
- **Runtime**: PixiJS v8 (uses PixiJS Container as base class)
- **Language**: TypeScript with ESNext target
- **Module System**: ESNext with bundler resolution
- **Build Tool**: Vite (library mode for bundling)
- **Testing**: Jest
- **Package Manager**: pnpm (based on `pnpm-lock.yaml`)

## Development Workflow
- **Build**: Vite configured for library mode - this is a distributable package, not an application
- **Testing**: Jest for unit tests (separate examples repo exists for integration/demo)
- **Distribution**: Built as a library to be consumed by other projects
- This repository contains ONLY the library code - examples and demos are maintained separately

## Key Files
- `src/PixieTileGrid.ts`: Main class - extends `PIXI.Container` with tile-specific rendering logic
- `tsconfig.json`: Strict mode enabled, targets modern ESNext with DOM types

## Coding Conventions
- **Strict TypeScript**: All compiler strict flags enabled
- **Readonly Properties**: Use `readonly` for immutable configuration (e.g., `tileWidth`, `tileHeight`)
- **Private Members**: Prefix with `_` (e.g., `_options`)
- **Interface-Driven**: Explicitly typed options interfaces (`TileGridOptions`, `LayerDefinition`)

## What NOT to Add
- Game logic (entity systems, collision detection, pathfinding)
- Input handling or event management
- State management or data persistence
- Animation systems (beyond what PixiJS provides)
- Physics or gameplay mechanics

Keep this library focused on efficient tile rendering only.
