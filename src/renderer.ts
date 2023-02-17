export default class Renderer {
  screen: HTMLElement;
  width: number;
  height: number;
  stripWidth = 2;
  screenStrips: HTMLElement[] = [];

  constructor() {
    this.screen = document.createElement("div");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.screen.id = "screen";
    document.body.prepend(this.screen);

    this.init();
  }

  init() {
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
