const { Input } = require('./input');
const { Logic } = require('./logic');
const { Physics } = require('./physics');
const { Renderer } = require('./renderer');
const { Network } = require('./network');
const PIXI = require('pixi.js');
const Matter = require('matter-js');
const { Render } = require('matter-js');

const log = console.log;
const RealWormClient = () => {
  const width = 800;
  const height = 600;

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
  window.addEventListener('keydown', function (evt) {
    input.keydown(Input.toKeyCode(evt));
  });
  window.addEventListener('keyup', e => {
    input.keyup(Input.toKeyCode(e));
  });

  const hitPlayer = ({ bid, pid }) => {
    logic.hitPlayer(bid, pid);
    physics.removePlayer(pid);
    renderer.removePlayer(pid);
  }
  const hitBullet = ({ bid }) => {
    renderer.removeBullet(bid);
  }
  const gameLoop = (inputs) => {
    inputs.forEach((input, index) => {
      if (input.touches > 0) {
        console.log("input > 0", input);
        const mousePos = input.touchPos;
        const id = ++bulletId;

        logic.addBullet(id);
        physics.shoot(id, index, mousePos);
        renderer.addBullet(id);
      }
      if (input.keys.includes("a".charCodeAt(0))) {
        physics.jump(index, 0);
      } else if (input.keys.includes("d".charCodeAt(0))) {
        physics.jump(index, 1);
      }
    });
  }

  let bulletId = 0;
  const dtEngine = 16;
  const input = Input();
  const logic = Logic();
  const physics = Physics(dtEngine);
  const renderer = Renderer(app, physics);

  Matter.Events.on(physics, 'hit-player', hitPlayer);
  Matter.Events.on(physics, 'hit-bullet', hitBullet);
  Matter.Events.on(physics, 'refrest-terrain', Renderer.refreshTerrain(renderer));
  physics.refreshTerrain();

  let started = false;
  const startStreaming = (roomId, myIndex, startTime, players) => {
    if (started) return;
    started = true;
    log('start', myIndex);
    const playerCount = players.length;
    const network = Network(input, gameLoop, roomId, myIndex, playerCount);
    // todo: not hardcode this
    players.forEach(player => {
      const { id, position } = player;
      console.log("addP", id, position);
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
      if (canStep) {
        physics.step();
        frameCount++;
      }

      const bufferSize = network.bufferSize();
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

  return {
    startStreaming,
  };
}

module.exports.RealWormClient = RealWormClient;