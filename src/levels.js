import seedrandom from "seedrandom";

function generateMap(width, height, seed) {
  const random = seedrandom(
    seed || window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
  );

  const rootRoom = { x: 0, y: 0, width, height };

  // Binary Space Partitioning
  const rooms = [];
  const lines = [];
  const partition = (room) => {
    if (room.width < 20 || room.height < 20) {
      rooms.push(room);
    } else {
      const { leftRoom, rightRoom, line } = partitionRoom(room, random);
      partition(leftRoom);
      partition(rightRoom);
      rooms.push(leftRoom, rightRoom);
      lines.push(line);
    }
  };
  partition(rootRoom);

  const map = Array(height)
    .fill()
    .map(() => Array(width).fill(1));

  rooms.forEach((room) => {
    for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
      for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
        map[y][x] = 0;
      }
    }

    const cx = Math.floor(room.x + room.width / 2);
    const cy = Math.floor(room.y + room.height / 2);
    map[cy][cx] = 2;
  });

  lines.forEach((line) => {
    const { start, end } = line;
    if (start.x === end.x) {
      for (let y = start.y; y < end.y; y++) {
        map[y][start.x] = 1;
      }
    } else {
      for (let x = start.x; x < end.x; x++) {
        map[start.y][x] = 1;
      }
    }
  });

  return map;
}

function partitionRoom(room, random) {
  const isVertical = random() < 0.5;

  const splitPoint = {
    x: Math.floor(room.x + room.width * random()),
    y: Math.floor(room.y + room.height * random()),
  };

  const leftRoom = {
    x: room.x,
    y: room.y,
    width: isVertical ? splitPoint.x - room.x : room.width,
    height: isVertical ? room.height : splitPoint.y - room.y,
  };
  const rightRoom = {
    x: isVertical ? splitPoint.x : room.x,
    y: isVertical ? room.y : splitPoint.y,
    width: isVertical ? room.x + room.width - splitPoint.x : room.width,
    height: isVertical ? room.height : room.y + room.height - splitPoint.y,
  };
  const line = {
    start: { x: splitPoint.x, y: splitPoint.y },
    end: {
      x: isVertical ? splitPoint.x : splitPoint.x + 1,
      y: isVertical ? splitPoint.y + 1 : splitPoint.y,
    },
  };

  return { leftRoom, rightRoom, line };
}

const map = generateMap(50, 50, "seed");
console.log(map);

const levels = [
  {
    id: 0,
    name: "First level",
    "map": map,
  },
];

export default levels;
