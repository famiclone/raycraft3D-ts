class HUD {
  _canvas: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this._canvas = document.createElement("canvas") as HTMLCanvasElement;
    this._canvas.width = width;
    this._canvas.height = height;
    this._canvas.style.position = "absolute";
    this._canvas.style.top = "0";
    this._canvas.style.left = "0";
    this._canvas.id = "hud";
    this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;

    this.renderCrosshair();
  }

  get canvas() {
    return this._canvas;
  }

  get ctx() {
    return this._ctx;
  }

  renderCrosshair() {
    this._ctx.beginPath();
    this._ctx.moveTo(this.canvas.width / 2, this._canvas.height / 2);
    this._ctx.lineTo(this._canvas.width / 2 + 10, this._canvas.height / 2);
    this._ctx.moveTo(this._canvas.width / 2, this._canvas.height / 2);
    this._ctx.lineTo(this._canvas.width / 2 - 10, this._canvas.height / 2);
    this._ctx.moveTo(this._canvas.width / 2, this._canvas.height / 2);
    this._ctx.lineTo(this._canvas.width / 2, this._canvas.height / 2 + 10);
    this._ctx.moveTo(this._canvas.width / 2, this._canvas.height / 2);
    this._ctx.lineTo(this._canvas.width / 2, this._canvas.height / 2 - 10);
    this._ctx.strokeStyle = "red";
    this._ctx.stroke();
  }
}

export default class Renderer {
  screen: HTMLElement;
  width: number;
  height: number;
  stripWidth = 2;
  screenStrips: HTMLElement[] = [];

  constructor() {
    this.screen = document.createElement("div");
    this.width = 320;
    this.height = 200;
    this.screen.id = "screen";
    document.body.prepend(this.screen);

    this.init();
  }

  init() {
    document.body.style.cursor = "none";
    const hud = new HUD(this.width, this.height);

    const floor = document.createElement("div");
    floor.id = "floor";

    const ceiling = document.createElement("div");
    ceiling.id = "ceiling";

    const level = document.createElement("div");
    level.id = "level";

    const hand = document.createElement("div");
    hand.id = "hand";

    this.screen.appendChild(floor);
    this.screen.appendChild(ceiling);
    this.screen.appendChild(level);
    this.screen.appendChild(hand);
    this.screen.appendChild(hud.canvas);

    for (let i = 0; i < this.width; i += this.stripWidth) {
      const strip = document.createElement("div");
      strip.style.position = "absolute";
      strip.style.left = i + "px";
      strip.style.width = this.stripWidth + "px";
      strip.style.height = "0px";
      strip.style.overflow = "hidden";
      strip.style.backgroundColor = "magenta";

      const img = new Image();
      img.src = "public/walls.png";
      img.style.position = "absolute";
      img.style.left = "0px";

      strip.appendChild(img);
      // Assign the image to a property on the strip element
      // so we have easy access to the image later
      // @ts-ignore
      strip.img = img;

      this.screenStrips.push(strip);
      level.appendChild(strip);
    }
  }

  drawRay() {}

  castSingleRay() {}

  drawMiniMap() {}

  updateMiniMap() {}
}
