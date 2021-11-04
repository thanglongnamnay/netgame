const Game = require('../real-worm/Game.bs');
const Player = require('../real-worm/Player.bs');
const Bullet = require('../real-worm/Bullet.bs');
const Logic = () => {
  let game = Game.make();
  const addPlayer = id => {
    game = Game.step(game, Game.addPlayers([Player.make(id, 1)]));
    return logic;
  }
  const addBullet = id => {
    game = Game.step(game, Game.addBullet(Bullet.make(id, 50)));
    return logic;
  }
  const removeBullet = id => {
    game = Game.step(game, Game.removeBullet(id));
    return logic;
  }
  const hitPlayer = (bid, pid) => {
    game = Game.step(game, Game.bulletHit(bid, pid));
    return logic;
  }

  const logic = {
    getGame: () => game,
    addPlayer,
    addBullet,
    removeBullet,
    hitPlayer,
  }
  return logic;
}

module.exports.Logic = Logic;