import Person from "./person";

export default class Player extends Person {
  id: string;
  pos: { x: number; y: number };
  speed: number;
  moveSpeed: number;
  rotation: number;
  direction: {x: number, y: number};
  rotationSpeed: number;
  isStrafing: boolean = false;

  constructor(id: string) {
    super(id);
    this.id = id;
    this.pos = { x: 16, y: 10 };
    this.speed = 0;
    this.moveSpeed = 0.005;
    this.rotation = 0;
    this.direction = {x: 0, y: 0};
    this.rotationSpeed = (6 * Math.PI) / 360;
  }
}
