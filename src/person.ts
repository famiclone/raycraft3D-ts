export default class Person {
  id: string;
  pos: { x: number; y: number };
  speed: number;
  moveSpeed: number;
  rotation: number;
  direction: { x: number; y: number };
  rotationSpeed: number;

  constructor(id: string) {
    this.id = id;
    this.pos = { x: 0, y: 0 };
    this.speed = 0;
    this.moveSpeed = 0;
    this.rotation = 0;
    this.direction = { x: 0, y: 0 };
    this.rotationSpeed = 0;
  }
}
