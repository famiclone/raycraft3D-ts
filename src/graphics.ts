export default class Graphics {
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  constructor(w: number = 320, h: number = 240) {
    this._canvas = document.createElement("canvas");
    this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;

    document.body.appendChild(this._canvas);
    this._canvas.width = w;
    this._canvas.height = h;
  }

  private async _load(src: string) {
    return new Promise<HTMLImageElement>((resolve) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        resolve(image);
      };
    });
  }

  public async image(src: string) {
    const image = this._load(src);

    if (image !== undefined) {
      return await image;
    }

    throw new Error("Image not loaded");
  }

  public render(image: HTMLImageElement, x: number, y: number): void {
    this._context.drawImage(image, x, y);
  }
}
