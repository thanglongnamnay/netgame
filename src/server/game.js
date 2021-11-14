const { Logic } = require('../common/logic');
const { Physics } = require('../common/physics');
const Game = require('../real-worm/Game.bs');
const Action = require('../real-worm/Action.bs');
const Matter = require('matter-js');

const jumpStrength = 5;
const jumpLeft = { x: -jumpStrength, y: -jumpStrength };
const jumpRight = { x: jumpStrength, y: -jumpStrength };
const dtEngine = 16;
const startGame = ({ id, seed, players }, onEndGame) => {
  const hitPlayer = ({ bid, pid }) => {
    console.log("hitPlayer", bid, pid);
    logic.hitPlayer(bid, pid);
    if (Game.Helper.findPlayer(logic.getGame(), pid).hp <= 0) {
      physics.removePlayer(pid);
    }
    if (logic.getGame().players.filter(p => p.hp > 0).length <= 1) {
      return onEndGame();
    }
  }
  const hitBullet = ({ bid }) => {
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
        console.log("shoot", id, index, direction);
      });
      Action.getJump(player.action).forEach(direction => {
        physics.jump(index, direction);
      });
      logic.tick();
      return;
    });
    gameTick++;
  }

  let bulletId = 0;
  const logic = Logic();
  const physics = Physics(seed, dtEngine);

  Matter.Events.on(physics, 'hit-player', hitPlayer);
  Matter.Events.on(physics, 'hit-bullet', hitBullet);
  physics.refreshTerrain();

  // todo: not hardcode this
  players.forEach(player => {
    const { index: id, position } = player;
    logic.addPlayer(id);
    physics.addPlayer(id, position);
  });
  return function step(inputs) {
    gameLoop(inputs);
    physics.step();
    physics.step();
  };
};

module.exports.startGame = startGame;