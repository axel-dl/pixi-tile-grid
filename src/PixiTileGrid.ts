import * as PIXI from 'pixi.js';

export interface LayerDefinition {
    name: string;
    zIndex?: number;
    data : number[][]; // Array of tile indices
}

export interface TileGridOptions {
    mapData: LayerDefinition[];
    spriteSheet: PIXI.Spritesheet;
    tileWidth: number;
    tileHeight: number;
    tileToIdTextureKey?: (tileIndex: number) => string;
    chunkSize?: number; // in tiles, default to 16
    cullingMargin?: number; // in tiles, default to 2

}


export class PixiTileGrid extends PIXI.Container {
    readonly tileWidth: number;
    readonly tileHeight: number
    private _options: TileGridOptions;
    private _chunkSize: number;
    private _cullingMargin: number;
    private _layers: Map<string, PIXI.Container> = new Map();

    constructor(options: TileGridOptions) {
        super();
        if (!options.mapData || options.mapData.length === 0) {
            throw new Error("PixiTileGrid: mapData is required and must contain at least one layer");
        }
        if (!options.spriteSheet) {
            throw new Error("PixiTileGrid: spriteSheet is required");
        }
        if (!options.tileWidth || options.tileWidth <= 0) {
            throw new Error('tileWidth must be positive');
        }
    
        if (!options.tileHeight || options.tileHeight <= 0) {
            throw new Error('tileHeight must be positive');
        }

        this._options = options;
        this.tileWidth = options.tileWidth;
        this.tileHeight = options.tileHeight;
        this._chunkSize = options.chunkSize ?? 16;
        this._cullingMargin = options.cullingMargin ?? 2;
        
        // Initialize and render all layers
        this._initializeLayers();
    }

    private _initializeLayers(): void {
        const sortedLayers = [...this._options.mapData].sort((a, b) => {
            const zIndexA = a.zIndex ?? 0;
            const zIndexB = b.zIndex ?? 0;
            return zIndexA - zIndexB;
        });

        for (const layerDef of sortedLayers) {
            const layerContainer = new PIXI.Container();
            layerContainer.label = `Layer: ${layerDef.name}`;
            layerContainer.zIndex = layerDef.zIndex ?? 0;

            this._layers.set(layerDef.name, layerContainer);
            this._renderLayer(layerContainer, layerDef);
            this.addChild(layerContainer);
        }

        this.sortableChildren = true;
    }

    private _renderLayer(container: PIXI.Container, layerDef: LayerDefinition): void {
        const { data } = layerDef;

        if (!data || data.length === 0) {
            console.warn(`PixiTileGrid: Layer "${layerDef.name}" has no tile data`);
            return;
        }

        const rows = data.length;

        for (let row = 0; row < rows; row++) {
            const rowData = data[row];
            if (!rowData) continue;
            
            const cols = rowData.length;
            
            for (let col = 0; col < cols; col++) {
                const tileIndex = rowData[col];
                
                if (tileIndex === 0 || tileIndex === undefined) {
                    continue;
                }
                
                const sprite = this._createTileSprite(tileIndex, col, row);
                
                if (sprite) {
                    container.addChild(sprite);
                }
            }
        }
    }

    private _createTileSprite(tileIndex: number, col: number, row: number): PIXI.Sprite | null {
        let textureKey: string;
        
        if (this._options.tileToIdTextureKey) {
            textureKey = this._options.tileToIdTextureKey(tileIndex);
        } else {
            textureKey = tileIndex.toString();
        }

        const texture = this._options.spriteSheet.textures[textureKey];
        
        if (!texture) {
            console.warn(`PixiTileGrid: Texture not found for key "${textureKey}" (tile index: ${tileIndex})`);
            return null;
        }

        const sprite = new PIXI.Sprite(texture);
        sprite.x = col * this.tileWidth;
        sprite.y = row * this.tileHeight;
        sprite.width = this.tileWidth;
        sprite.height = this.tileHeight;

        return sprite;
    }
}

export default PixiTileGrid;