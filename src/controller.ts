import Game from "./game";

class Controller {
  game: Game;
  keysPressed: { [key: string]: boolean } = {};

  constructor(game: Game) {
    this.game = game;
    this.enablePointerLock();
    this.init();
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed[key];
  }

  onKeydown(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW":
        this.keysPressed[e.code] = true;
        break;
      case "KeyS":
        this.keysPressed[e.code] = true;
        break;
      case "KeyA":
        this.keysPressed[e.code] = true;
        break;
      case "KeyD":
        this.keysPressed[e.code] = true;
        break;
      case "ShiftLeft":
        this.keysPressed[e.code] = true;
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
        break;
      case "KeyA":
        this.keysPressed[e.code] = false;
      case "KeyD":
        this.keysPressed[e.code] = false;
        break;
      case "ShiftLeft":
        this.keysPressed[e.code] = false;
    }
  }
  enablePointerLock() {
    document.addEventListener('click', () => {
      document.body.requestPointerLock();
    });

    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(e: MouseEvent) {
    const rotationChange = e.movementX * this.game.player.rotationSpeed;
    this.game.player.rotation += rotationChange;
  }


  init() {
    console.log("Controller initialized");
    window.addEventListener("keydown", this.onKeydown.bind(this));
    window.addEventListener("keyup", this.onKeyup.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  update(dt: number) {
    if (this.isKeyPressed("KeyW")) {
      this.game.player.speed = 1;
      this.game.player.direction.y = -1;
      //hand.style.animation = "walk 1.5s infinite";
    }

    if (this.isKeyPressed("KeyS")) {
      this.game.player.speed = -1;
      this.game.player.direction.y = 1;
      //hand.style.animation = "walk 1.5s infinite";
    }

    if (this.isKeyPressed("KeyA")) {
      this.game.player.direction.x = 1;
      this.game.player.speed = -1;
      //hand.style.animation = "walk 1.5s infinite";
    }

    if (this.isKeyPressed("KeyD")) {
      this.game.player.direction.x = -1;
      this.game.player.speed = 1;
      //hand.style.animation = "walk 1.5s infinite";
    }

    if (this.isKeyPressed("ShiftLeft")) {
      this.game.player.speed *= 2;
    }

    if (this.isKeyPressed("Space")) {
      this.game.player.speed = 0;
      this.game.player.direction.y = 0;
      this.game.player.direction.x = 0;
      //hand.style.animation = "";
    }


    // if key not pressed, stop moving
    if (!this.isKeyPressed("KeyW") && !this.isKeyPressed("KeyS")) {
      this.game.player.direction.y = 0;
    }

    if (!this.isKeyPressed("KeyA") && !this.isKeyPressed("KeyD")) {
      this.game.player.direction.x = 0;
    }

    if (!this.isKeyPressed("ShiftLeft")) {
      this.game.player.speed /= 2;
    }
  }
}

export default Controller;
