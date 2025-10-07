import { describe, it, expect, beforeEach } from '@jest/globals';
import { PixiTileGrid, LayerDefinition, TileGridOptions } from '../src/PixiTileGrid';
import * as PIXI from 'pixi.js';

describe('PixiTileGrid', () => {
  let mockSpritesheet: PIXI.Spritesheet;
  let mockTexture: PIXI.Texture;

  beforeEach(() => {
    // Create a mock texture
    mockTexture = new PIXI.Texture();
    
    // Create a mock spritesheet with textures
    // Include both numeric string keys (default toString() mapping) 
    // and prefixed keys (for tileToIdTextureKey tests)
    mockSpritesheet = {
      textures: {
        '1': mockTexture,
        '2': mockTexture,
        '3': mockTexture,
        '4': mockTexture,
        '5': mockTexture,
        'tile_1': mockTexture,
        'tile_2': mockTexture,
        'tile_3': mockTexture,
        'tile_4': mockTexture,
        'tile_5': mockTexture,
      }
    } as unknown as PIXI.Spritesheet;
  });

  describe('Constructor Validation', () => {
    it('should throw error when mapData is empty', () => {
      expect(() => {
        new PixiTileGrid({
          mapData: [],
          spriteSheet: mockSpritesheet,
          tileWidth: 32,
          tileHeight: 32
        });
      }).toThrow('mapData is required and must contain at least one layer');
    });

    it('should throw error when spriteSheet is missing', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1, 2]] }
      ];
      
      expect(() => {
        new PixiTileGrid({
          mapData: layers,
          spriteSheet: null as any,
          tileWidth: 32,
          tileHeight: 32
        });
      }).toThrow('spriteSheet is required');
    });

    it('should throw error when tileWidth is zero or negative', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1, 2]] }
      ];
      
      expect(() => {
        new PixiTileGrid({
          mapData: layers,
          spriteSheet: mockSpritesheet,
          tileWidth: 0,
          tileHeight: 32
        });
      }).toThrow('tileWidth must be positive');
    });

    it('should throw error when tileHeight is zero or negative', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1, 2]] }
      ];
      
      expect(() => {
        new PixiTileGrid({
          mapData: layers,
          spriteSheet: mockSpritesheet,
          tileWidth: 32,
          tileHeight: -5
        });
      }).toThrow('tileHeight must be positive');
    });

    it('should create instance with valid options', () => {
      const layers: LayerDefinition[] = [
        { name: 'ground', data: [[1, 2], [3, 4]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      expect(grid).toBeInstanceOf(PixiTileGrid);
      expect(grid).toBeInstanceOf(PIXI.Container);
      expect(grid.tileWidth).toBe(32);
      expect(grid.tileHeight).toBe(32);
    });
  });

  describe('Default Values', () => {
    it('should use default chunkSize of 16', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      expect((grid as any)._chunkSize).toBe(16);
    });

    it('should use default cullingMargin of 2', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      expect((grid as any)._cullingMargin).toBe(2);
    });

    it('should use custom chunkSize and cullingMargin', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32,
        chunkSize: 32,
        cullingMargin: 5
      });

      expect((grid as any)._chunkSize).toBe(32);
      expect((grid as any)._cullingMargin).toBe(5);
    });
  });

  describe('Layer Creation', () => {
    it('should create containers for each layer', () => {
      const layers: LayerDefinition[] = [
        { name: 'ground', data: [[1, 2]] },
        { name: 'objects', data: [[3, 4]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      // Grid should have 2 child containers (one per layer)
      expect(grid.children.length).toBe(2);
    });

    it('should sort layers by zIndex', () => {
      const layers: LayerDefinition[] = [
        { name: 'foreground', zIndex: 10, data: [[1]] },
        { name: 'background', zIndex: -10, data: [[2]] },
        { name: 'ground', zIndex: 0, data: [[3]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      // Check children are in correct zIndex order
      expect(grid.children[0].zIndex).toBe(-10);
      expect(grid.children[1].zIndex).toBe(0);
      expect(grid.children[2].zIndex).toBe(10);
    });

    it('should enable sortableChildren', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      expect(grid.sortableChildren).toBe(true);
    });
  });

  describe('Tile Rendering', () => {
    it('should skip empty tiles (index 0)', () => {
      const layers: LayerDefinition[] = [
        { 
          name: 'test', 
          data: [
            [1, 0, 2],
            [0, 3, 0]
          ] 
        }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      const layerContainer = grid.children[0] as PIXI.Container;
      // Should only have 3 sprites (1, 2, 3), zeros are skipped
      expect(layerContainer.children.length).toBe(3);
    });

    it('should position sprites correctly', () => {
      const layers: LayerDefinition[] = [
        { 
          name: 'test', 
          data: [
            [1, 2],
            [3, 4]
          ] 
        }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      const layerContainer = grid.children[0] as PIXI.Container;
      const sprites = layerContainer.children as PIXI.Sprite[];

      // Check positions: (col * tileWidth, row * tileHeight)
      expect(sprites[0].x).toBe(0);   // col 0
      expect(sprites[0].y).toBe(0);   // row 0
      
      expect(sprites[1].x).toBe(32);  // col 1
      expect(sprites[1].y).toBe(0);   // row 0
      
      expect(sprites[2].x).toBe(0);   // col 0
      expect(sprites[2].y).toBe(32);  // row 1
      
      expect(sprites[3].x).toBe(32);  // col 1
      expect(sprites[3].y).toBe(32);  // row 1
    });

    it('should set sprite dimensions', () => {
      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 64,
        tileHeight: 48
      });

      const layerContainer = grid.children[0] as PIXI.Container;
      const sprite = layerContainer.children[0] as PIXI.Sprite;

      expect(sprite.width).toBe(64);
      expect(sprite.height).toBe(48);
    });
  });

  describe('Tile Mapping', () => {
    it('should use tileToIdTextureKey when provided', () => {
      mockSpritesheet.textures = {
        'custom_1': mockTexture,
        'custom_2': mockTexture
      };

      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1, 2]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32,
        tileToIdTextureKey: (index) => `custom_${index}`
      });

      const layerContainer = grid.children[0] as PIXI.Container;
      // Should successfully create 2 sprites using custom mapping
      expect(layerContainer.children.length).toBe(2);
    });

    it('should use toString() as default mapping', () => {
      mockSpritesheet.textures = {
        '1': mockTexture,
        '2': mockTexture
      };

      const layers: LayerDefinition[] = [
        { name: 'test', data: [[1, 2]] }
      ];
      
      const grid = new PixiTileGrid({
        mapData: layers,
        spriteSheet: mockSpritesheet,
        tileWidth: 32,
        tileHeight: 32
      });

      const layerContainer = grid.children[0] as PIXI.Container;
      // Should successfully create 2 sprites using default mapping
      expect(layerContainer.children.length).toBe(2);
    });
  });
});
