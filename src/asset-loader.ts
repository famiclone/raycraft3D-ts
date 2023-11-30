export type AssetList = {
  [key: string]: any;
};

export default class AssetLoader {
  constructor() {
  }

  async loadAssets(paths: string[]): Promise<AssetList> {
    const assets: AssetList = {};

    for (const path of paths) {
      const asset = await this.loadAsset(path);
      assets[path] = asset;
    }

    return assets;
  }

  async loadAsset(path: string): Promise<any> {
    const type = path.split('.').pop();

    switch (type) {
      case 'png':
        return await this.loadImage(path);
      case 'txt':
        return await this.loadText(path);
      case 'json':
        return await this.loadJSON(path);
      default:
        throw new Error(`Unknown asset type: ${type}`);
    }
  }

  async loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  async loadText(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const response = fetch(path);
      const text = response.then((res) => res.text());
      resolve(text);
    });
  }

  async loadJSON(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const response = fetch(path);
      const json = response.then((res) => res.json());
      resolve(json);
    });
  }
}
