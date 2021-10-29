import * as Engine from "./engine/Engine.bs"
import { spriteCache } from "./sprite-cache"

const colors = ['white', 'green', 'blue', 'cyan'];
export function make(playerCount: number, canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const drawSprite = (sprite: ImageBitmap, transform) => {
    if (!sprite) {
      console.log("wow");
      return;
    }
    const { position, rotation, scale } = transform;
    const dWidth = scale.x * sprite.width;
    const dHeight = scale.y * sprite.height
    const oldTransform = context.getTransform();
    context.translate(position.x, position.y);
    context.scale(scale.x, scale.y);
    context.rotate(rotation);
    context.drawImage(sprite, -dWidth / 2, -dHeight / 2, dWidth, dHeight);

    context.setTransform(oldTransform);
  }
  const renderSprite = node => {
    const sprite = node.skills.sprite;
    const transform = node.skills.transform;
    if (!sprite || !transform) {
      console.log("null", sprite, transform);
      return false;
    }
    drawSprite(spriteCache.get(sprite.src), transform);
    return true;
  }
  const renderNode = (node, i) => {
    console.log("renderNode", i, node);
    const transform = node.skills.transform;
    const { position, rotation, scale } = transform;
    const oldTransform = context.getTransform();
    context.translate(position.x, position.y);
    context.scale(scale.x, scale.y);
    context.rotate(rotation);
    // context.drawImage(sprite, -dWidth / 2, -dHeight / 2, dWidth, dHeight);

    context.beginPath();
    context.arc(0, 0, 20, 0, Math.PI * 2);
    context.fillStyle = colors[i];
    context.fill();
    context.setTransform(oldTransform);
  }
  const render = world => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // todo: draw all objects
    // world.nodes.forEach(renderNode);
    for (let node of world.nodes) {
      renderSprite(node);
    }
  }

  let world = Engine.createWorld(playerCount);
  function mainLoop(dt, inputs) {
    console.log("mainLoop", dt, inputs, world);
    world = Engine.step(world, inputs, dt);
    render(world);
  };

  return mainLoop;
}