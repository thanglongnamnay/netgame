const { Input } = require('./input');
const { Logic } = require('../common/logic');
const { Physics } = require('../common/physics');
const { Renderer } = require('./renderer');
const { Network } = require('./network');
const Game = require('../real-worm/Game.bs');
const Action = require('../real-worm/Action.bs');
const PIXI = require('pixi.js');
const Matter = require('matter-js');
const { loadSound } = require('./sound');

const width = 800;
const height = 600;
const log = console.log;
const jumpStrength = 5;
const jumpLeft = { x: -jumpStrength, y: -jumpStrength };
const jumpRight = { x: jumpStrength, y: -jumpStrength };
const dtEngine = 16;
const Sound = loadSound();
const input = Input();
window.addEventListener('keydown', function (evt) {
  input.keydown(Input.toKeyCode(evt));
});
window.addEventListener('keyup', e => {
  input.keyup(Input.toKeyCode(e));
});
let started = false;
const startStreaming = ({ id, seed, index, startTime, players }) => {
  if (started) return;
  const roomId = id;
  const myIndex = index;
  started = true;

  const app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x000000,
    antialias: true,
  });
  document.body.appendChild(app.view);

  app.renderer.plugins.interaction.on('pointerup', e => {
    input.touchdown(e.data.getLocalPosition(renderer.getObjects().terrain));
  });

  const hitPlayer = ({ bid, pid }) => {
    logic.hitPlayer(bid, pid);
    if (Game.Helper.findPlayer(logic.getGame(), pid).hp <= 0) {
      physics.removePlayer(pid);
      renderer.removePlayer(pid);
    }
  }
  const hitBullet = ({ bid }) => {
    renderer.removeBullet(bid);
    Sound.explode();
  }
  let gameTick = 0;
  const gameLoop = (inputs) => {
    inputs.forEach((input, index) => {
      const tick = gameTick;
      if (input.touches > 0) logic.shoot(index, input.touchPos, tick);
      if (input.keys.includes("a".charCodeAt(0))) logic.jump(index, jumpLeft, tick);
      else if (input.keys.includes("d".charCodeAt(0))) logic.jump(index, jumpRight, tick);
      const player = Game.Helper.findPlayer(logic.getGame(), index);
      if (player.hp <= 0) return; // player dead
      Action.getShoot(player.action).forEach(direction => {
        const id = ++bulletId;
        logic.addBullet(id);
        physics.shoot(id, index, direction);
        renderer.addBullet(id);
        Sound.shoot();
      });
      Action.getJump(player.action).forEach(direction => {
        physics.jump(index, direction);
        Sound.jump();
      });
      logic.tick();
      return;
    });
    gameTick++;
  }

  let bulletId = 0;
  const logic = Logic();
  const physics = Physics(seed, dtEngine);
  const renderer = Renderer(app, physics);

  Matter.Events.on(physics, 'hit-player', hitPlayer);
  Matter.Events.on(physics, 'hit-bullet', hitBullet);
  Matter.Events.on(physics, 'refrest-terrain', Renderer.refreshTerrain(renderer));
  physics.refreshTerrain();


  log('start', myIndex);
  const playerCount = players.length;
  const network = Network(input, gameLoop, roomId, myIndex, playerCount);
  // todo: not hardcode this
  players.forEach(player => {
    const { id, position } = player;
    logic.addPlayer(id);
    physics.addPlayer(id, position);
    renderer.addPlayer(id);
  });
  let frameCount = 0;
  (function run() {
    const now = Date.now();
    if (now < startTime) {
      console.log("now", now, startTime);
      setTimeout(run, dtEngine);
      return;
    }
    let canStep = true;
    if (frameCount % 2 === 0) {
      try {
        network.step();
      } catch (e) {
        console.log("error", e);
        canStep = false;
      }
    }
    const bufferSize = network.bufferSize();
    if (canStep) {
      physics.step();
      frameCount++;
    }
    if (frameCount % 6 === 0) {
      network.sendUpdate();
    }
    if (bufferSize > 3) {
      setTimeout(run, 0);
    } else {
      setTimeout(run, dtEngine);
    }
  })();
};


module.exports.startStreaming = startStreaming;