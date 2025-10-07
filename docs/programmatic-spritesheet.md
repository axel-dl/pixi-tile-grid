# Programmatic Spritesheet (Generate tiles at runtime)

When you don't have pre-made tile images you can generate a simple spritesheet in memory using the Canvas API and use it with PixiTileGrid. This is useful for prototyping or when tiles are simple solid colors.

Overview

- Create an offscreen canvas and draw each tile type into adjacent frames.
- Create a PIXI.Texture from the canvas and use its `baseTexture`.
- Build a spritesheet data object describing frame positions and sizes.
- Create a `PIXI.Spritesheet` with the base texture and data, then `await spritesheet.parse()`.

Recipe (TypeScript)

```ts
// colorMap: { 1: 0x00aa00, 2: 0x8B4513 }
async function generateSpritesheet(tileSize: number, colorMap: Record<number, number | string | null>) {
  const types = Object.keys(colorMap).filter(k => colorMap[Number(k)] !== null);
  const canvas = document.createElement('canvas');
  canvas.width = tileSize * types.length;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d')!;

  const frames: Record<string, any> = {};
  let offset = 0;
  for (const key of types) {
    const color = colorMap[Number(key)];
    if (color == null) { offset += tileSize; continue; }
    const colorHex = typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : (String(color).startsWith('#') ? String(color) : `#${color}`);
    ctx.fillStyle = colorHex;
    ctx.fillRect(offset, 0, tileSize, tileSize);

    frames[`tile_${key}`] = {
      frame: { x: offset, y: 0, w: tileSize, h: tileSize },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: tileSize, h: tileSize },
      sourceSize: { w: tileSize, h: tileSize }
    };

    offset += tileSize;
  }

  const textureFromCanvas = PIXI.Texture.from(canvas);
  const baseTexture = textureFromCanvas.baseTexture;
  const sheetData = { frames, meta: { scale: '1' } } as any;
  const sheet = new PIXI.Spritesheet(baseTexture, sheetData);
  await sheet.parse();
  return sheet;
}
```

Usage

1. Generate spritesheet: `const sheet = await generateSpritesheet(16, { 1: 0x00aa00, 2: 0x8B4513 })`
2. Create PixiTileGrid using `spriteSheet: sheet`
3. Map tile indices to keys with a mapping function such as:

```ts
tileToIdTextureKey: (i) => (i === 0 ? null : `tile_${i}`)
```

Notes

- Keep the mapping function fast — it is called per tile during rendering.
- Programmatic spritesheets are best for simple prototyping. For rich art, use image atlases.
