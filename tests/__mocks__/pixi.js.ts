// Mock PixiJS for testing
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

  destroy(): void {
    this.children = [];
  }
}

export interface Spritesheet {
  textures: Record<string, Texture>;
}

export { Texture as PIXI_Texture, Sprite as PIXI_Sprite, Container as PIXI_Container };
