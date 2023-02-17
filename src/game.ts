//@ts-ignore
import levels from "./levels.js";
import Player from "./player";
import Renderer from "./renderer";

type Level = {
  id: number;
  name: string;
  map: number[][];
};

enum GameState {
  Playing,
  GameOver,
  Paused,
  Inventory,
  Trading,
  MainMenu,
}

const miniMap = document.querySelector("#miniMap") as HTMLCanvasElement;
const miniMapObjects = document.querySelector(
  "#miniMapObjects"
) as HTMLCanvasElement;
let miniMapScale = 8;
let lastTime = 0;
const screenWidth = 320;
const screenHeight = 200;
const stripWidth = 2;
const fov = (60 * Math.PI) / 180;
const fovHalf = fov / 2;
const numRays = Math.ceil(screenWidth / stripWidth);
const viewDist = screenWidth / 2 / Math.tan(fovHalf);
const twoPI = Math.PI * 2;
const numTextures = 4;

const debugScreen = document.querySelector("#debugScreen") as HTMLElement;

export default class Game {
  state:
    | "playing"
    | "gameover"
    | "paused"
    | "inventory"
    | "trading"
    | "mainmenu" = "mainmenu";
  mapWidth: number = 0;
  mapHeight: number = 0;
  level: Level;
  renderer: Renderer;
  controller: unknown;
  player: Player;

  constructor() {
    this.player = new Player("player");
    this.renderer = new Renderer();
    this.state = "mainmenu";
    this.level = levels[0];

    this.setup();
  }

  drawMiniMap = (): void => {
    miniMap.width = this.mapWidth * miniMapScale;
    miniMap.height = this.mapHeight * miniMapScale;

    miniMap.style.width = `${this.mapWidth * miniMapScale}px`;

    const ctx = miniMap.getContext("2d") as CanvasRenderingContext2D;

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (this.level.map[y][x] > 0) {
          ctx.fillStyle = "black";
          ctx.fillRect(
            x * miniMapScale,
            y * miniMapScale,
            miniMapScale,
            miniMapScale
          );
        }
      }
    }
  };

  updateMiniMap = () => {
    miniMapObjects.width = this.mapWidth * miniMapScale;
    miniMapObjects.height = this.mapHeight * miniMapScale;

    const ctx = miniMapObjects.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, miniMap.width, miniMap.height);

    ctx.fillStyle = "yellowgreen";
    ctx.fillRect(
      this.player.pos.x * miniMapScale - 2,
      this.player.pos.y * miniMapScale - 2,
      4,
      4
    );

    ctx.beginPath();
    ctx.moveTo(
      this.player.pos.x * miniMapScale,
      this.player.pos.y * miniMapScale
    );
    ctx.lineTo(
      (this.player.pos.x + Math.cos(this.player.rotation) * 4) * miniMapScale,
      (this.player.pos.y + Math.sin(this.player.rotation) * 4) * miniMapScale
    );

    ctx.closePath();
    ctx.stroke();
  };

  castRays() {
    let stripIdx = 0;

    for (let i = 0; i < numRays; i++) {
      const rayScreenPos = (-numRays / 2 + i) * stripWidth;

      const rayViewDist = Math.sqrt(
        rayScreenPos * rayScreenPos + viewDist * viewDist
      );

      const rayAngle = Math.asin(rayScreenPos / rayViewDist);

      this.castSingleRay(this.player.rotation + rayAngle, stripIdx++);
    }
  }

  castSingleRay(rayAngle: number, stripIdx: number) {
    // first make sure the angle is between 0 and 360 degrees
    rayAngle %= twoPI;
    if (rayAngle < 0) rayAngle += twoPI;

    // moving right/left? up/down? Determined by which quadrant the angle is in.
    var right = rayAngle > twoPI * 0.75 || rayAngle < twoPI * 0.25;
    var up = rayAngle < 0 || rayAngle > Math.PI;

    var wallType = 0;

    // only do these once
    var angleSin = Math.sin(rayAngle);
    var angleCos = Math.cos(rayAngle);

    var dist = 0; // the distance to the block we hit
    var xHit = 0; // the x and y coord of where the ray hit the block
    var yHit = 0;

    var textureX = 0; // the x-coord on the texture of the block, ie. what part of the texture are we going to render
    var wallX; // the (x,y) map coords of the block
    var wallY;

    var wallIsHorizontal = false;

    // first check against the vertical map/wall lines
    // we do this by moving to the right or left edge of the block we're standing in
    // and then moving in 1 map unit steps horizontally. The amount we have to move vertically
    // is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).

    var slope = angleSin / angleCos; // the slope of the straight line made by the ray
    var dXVer = right ? 1 : -1; // we move either 1 map unit to the left or right
    var dYVer = dXVer * slope; // how much to move up or down

    var x = right
      ? Math.ceil(this.player.pos.x)
      : Math.floor(this.player.pos.x); // starting horizontal position, at one of the edges of the current map block
    var y = this.player.pos.y + (x - this.player.pos.x) * slope; // starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

    while (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
      var wallX: any = Math.floor(x + (right ? 0 : -1));
      var wallY: any = Math.floor(y);

      // is this point inside a wall block?
      if (this.level.map[wallY][wallX] > 0) {
        var distX = x - this.player.pos.x;
        var distY = y - this.player.pos.y;
        dist = distX * distX + distY * distY; // the distance from the player to this point, squared.

        wallType = this.level.map[wallY][wallX]; // we'll remember the type of wall we hit for later
        textureX = y % 1; // where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use later when texturing the wall.
        if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

        xHit = x; // save the coordinates of the hit. We only really use these to draw the rays on minimap.
        yHit = y;

        wallIsHorizontal = true;

        break;
      }
      x += dXVer;
      y += dYVer;
    }

    // now check against horizontal lines. It's basically the same, just "turned around".
    // the only difference here is that once we hit a map block,
    // we check if there we also found one in the earlier, vertical run. We'll know that if dist != 0.
    // If so, we only register this hit if this distance is smaller.

    var slope = angleCos / angleSin;
    var dYHor = up ? -1 : 1;
    var dXHor = dYHor * slope;
    var y = up ? Math.floor(this.player.pos.y) : Math.ceil(this.player.pos.y);

    var x = this.player.pos.x + (y - this.player.pos.y) * slope;

    while (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
      var wallX: any = Math.floor(y + (right ? 0 : -1));
      var wallY: any = y >> 0;

      if (this.level.map[wallY][wallX] > 0) {
        var distX = x - this.player.pos.x;
        var distY = y - this.player.pos.y;

        var blockDist = distX * distX + distY * distY;
        if (!dist || blockDist < dist) {
          dist = blockDist;
          xHit = x;
          yHit = y;

          wallType = this.level.map[wallY][wallX];
          textureX = x % 1;
          if (up) textureX = 1 - textureX;
        }
        break;
      }
      x += dXHor;
      y += dYHor;
    }

    if (dist) {
      this.drawRay(xHit, yHit);

      var strip = this.renderer.screenStrips[stripIdx];

      dist = Math.sqrt(dist);

      // use perpendicular distance to adjust for fish eye
      // distorted_dist = correct_dist / cos(relative_angle_of_ray)
      dist = dist * Math.cos(this.player.rotation - rayAngle);

      // now calc the position, height and width of the wall strip

      // "real" wall height in the game world is 1 unit, the distance from the player to the screen is viewDist,
      // thus the height on the screen is equal to wall_height_real * viewDist / dist
      //

      var height = Math.round(viewDist / dist);

      // width is the same, but we have to stretch the texture to a factor of stripWidth to make it fill the strip correctly
      var width = height * stripWidth;

      // top placement is easy since everything is centered on the x-axis, so we simply move
      // it half way down the screen and then half the wall height back up.
      var top = Math.round((screenHeight - height) / 2);

      strip.style.height = height + "px";
      strip.style.top = top + "px";

      //@ts-ignore
      strip.img.style.height = Math.floor(height * numTextures) + "px";
      //@ts-ignore
      strip.img.style.width = Math.floor(width * 2) + "px";
      //@ts-ignore
      strip.img.style.top = -Math.floor(height * (wallType - 1)) + "px";

      var texX = Math.round(textureX * width);

      if (texX > width - stripWidth) texX = width - stripWidth;

      //@ts-ignore
      strip.img.style.left = -texX + "px";
    }
  }
  bindKeys() {
    const hand = document.querySelector("#hand") as HTMLElement;
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.player.speed = 1;
          hand.style.animation = "walk 1.5s infinite";
          break;
        case "KeyS":
          this.player.speed = -1;
          hand.style.animation = "walk 1.5s infinite";
          break;
        case "KeyA":
          this.player.direction = -1;
          //hand.style.animation = "walk 1.5s infinite";
          break;
        case "KeyD":
          this.player.direction = 1;
          //hand.style.animation = "walk 1.5s infinite";
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
        case "KeyS":
          this.player.speed = 0;
          hand.style.animation = "";

          break;
        case "KeyA":
        case "KeyD":
          this.player.direction = 0;
          hand.style.animation = "";
          break;
      }
    });
  }

  drawRay(rayX: number, rayY: number): void {
    const miniMapObjects = document.querySelector(
      "#miniMapObjects"
    ) as HTMLCanvasElement;
    var objectCtx = miniMapObjects.getContext("2d") as CanvasRenderingContext2D;

    objectCtx.strokeStyle = "rgba(0,100,0,0.3)";
    objectCtx.lineWidth = 0.5;
    objectCtx.beginPath();
    objectCtx.moveTo(
      this.player.pos.x * miniMapScale,
      this.player.pos.y * miniMapScale
    );
    objectCtx.lineTo(rayX * miniMapScale, rayY * miniMapScale);
    objectCtx.closePath();
    objectCtx.stroke();
  }

  setup(): void {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.width = 160;
    canvas.height = 120;

    this.mapWidth = this.level.map[0].length;
    this.mapHeight = this.level.map.length;

    this.bindKeys();
    this.drawMiniMap();

    this.loop(0);
  }

  isBlocking(x: number, y: number): boolean {
    // first make sure that we cannot move outside the boundaries of the level
    if (y < 0 || y >= this.mapHeight || x < 0 || x >= this.mapWidth)
      return true;

    // return true if the map block is not 0, ie. if there is a blocking wall.
    //console.log(this.level.map[Math.floor(y)][Math.floor(x)]);
    return this.level.map[Math.floor(y)][Math.floor(x)] !== 0;
  }

  movePlayer() {
    const moveStep = this.player.moveSpeed * this.player.speed;
    this.player.rotation += this.player.direction * this.player.rotationSpeed;

    const newX = this.player.pos.x + Math.cos(this.player.rotation) * moveStep;
    const newY = this.player.pos.y + Math.sin(this.player.rotation) * moveStep;

    if (this.isBlocking(newX, newY)) {
      console.log("is collide");
      return;
    }

    this.player.pos.x = newX;
    this.player.pos.y = newY;
    this.player.rotation += this.player.direction * this.player.rotationSpeed;

    if (this.player.rotation < 0) this.player.rotation += Math.PI * 2;
    if (this.player.rotation >= Math.PI * 2)
      this.player.rotation -= Math.PI * 2;
  }

  update(dt: number) {
    this.movePlayer();
    this.updateMiniMap();
    this.castRays();

    debugScreen.innerText = `
      FPS: ${Math.round(1 / dt)}
      PLAYER X: ${this.player.pos.x}
      PLAYER Y: ${this.player.pos.y}
      DT: ${dt}
    `;
  }

  loop(ts: number) {
    const dt = lastTime - ts;

    lastTime = ts;

    this.update(dt);

    requestAnimationFrame(this.loop.bind(this));
  }
}
