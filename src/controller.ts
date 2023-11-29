import Game from "./game";

class Controller {
  game: Game;
  keysPressed: { [key: string]: boolean } = {};

  constructor(game: Game) {
    this.game = game;
    this.init();
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed[key];
  }

  onKeydown(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW":
        this.keysPressed[e.code] = true;
        this.game.player.speed = 1;
        this.game.player.direction.y = -1;
        //hand.style.animation = "walk 1.5s infinite";
        break;
      case "KeyS":
        this.keysPressed[e.code] = true;
        this.game.player.speed = -1;
        this.game.player.direction.y = 1;
        //hand.style.animation = "walk 1.5s infinite";
        break;
      case "KeyA":
        this.keysPressed[e.code] = true;
        this.game.player.direction.x = 1;
        this.game.player.speed = -1;
        break;
      case "KeyD":
        this.keysPressed[e.code] = true;
        this.game.player.direction.x = -1;
        this.game.player.speed = 1;
        break;
      case "ShiftLeft":
        this.keysPressed[e.code] = true;
        this.game.player.speed *= 2;
        break;
    }
  }

  onKeyup(e: KeyboardEvent) {
    console.log(e);
    switch (e.code) {
      case "KeyW":
        this.keysPressed[e.code] = false;
      case "KeyS":
        this.keysPressed[e.code] = false;
        this.game.player.speed = 0;
        this.game.player.direction.y = 0;
        //hand.style.animation = "";

        break;
      case "KeyA":
        this.keysPressed[e.code] = false;
      case "KeyD":
        this.keysPressed[e.code] = false;
        this.game.player.speed = 0;
        this.game.player.direction.x = 0;
        //hand.style.animation = "";
        break;
      case "ShiftLeft":
        this.keysPressed[e.code] = false;
        this.game.player.speed /= 2;
    }
  }

  onMouseMove(e: MouseEvent) {
    document.addEventListener("mousemove", (e) => {
      const x = e.clientX - (window.innerWidth / 2) * this.game.player.rotationSpeed;
      this.game.player.rotation = (x / this.game.renderer.width) * 2 * Math.PI;
    });
  }


  init() {
    console.log("Controller initialized");
    window.addEventListener("keydown", this.onKeydown.bind(this));
    window.addEventListener("keyup", this.onKeyup.bind(this));
  }
}

export default Controller;
