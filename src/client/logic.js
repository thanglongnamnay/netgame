const Game = require('../real-worm/Game.bs');
const Player = require('../real-worm/Player.bs');
const Action = require('../real-worm/Action.bs');
const Bullet = require('../real-worm/Bullet.bs');
const Logic = (config) => {
  let t = Game.make();
  const addPlayer = id => {
    t = Game.step(t, Game.addPlayers([Player.make(id, 100, Action.make(30, 60))]));
  }
  const addBullet = id => {
    t = Game.step(t, Game.addBullet(Bullet.make(id, 50)));
  }
  const removeBullet = id => {
    t = Game.step(t, Game.removeBullet(id));
  }
  const hitPlayer = (bid, pid) => {
    t = Game.step(t, Game.bulletHit(bid, pid));
  }
  const jump = (pid, direction, tick) => {
    t = Game.step(t, Game.playerAction(pid, Player.jump(direction, tick)));
  }
  const shoot = (pid, direction, tick) => {
    t = Game.step(t, Game.playerAction(pid, Player.shoot(direction, tick)));
  }
  const tick = () => {
    t = Game.step(t, Game.tick);
  }

  const logic = {
    getGame: () => t,
    addPlayer,
    addBullet,
    removeBullet,
    hitPlayer,
    jump,
    shoot,
    tick,
  }
  return logic;
}

module.exports.Logic = Logic;