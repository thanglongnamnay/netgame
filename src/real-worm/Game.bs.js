// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Belt_List = require("@rescript/std/lib/js/belt_List.js");
var Belt_Array = require("@rescript/std/lib/js/belt_Array.js");
var Caml_option = require("@rescript/std/lib/js/caml_option.js");
var Utils$Netgame = require("./Utils.bs.js");
var Player$Netgame = require("./Player.bs.js");

function addPlayers(param_0) {
  return {
          TAG: /* AddPlayers */0,
          _0: param_0
        };
}

function removePlayer(param_0) {
  return {
          TAG: /* RemovePlayer */1,
          _0: param_0
        };
}

function addBullet(param_0) {
  return {
          TAG: /* AddBullet */2,
          _0: param_0
        };
}

function removeBullet(param_0) {
  return {
          TAG: /* RemoveBullet */3,
          _0: param_0
        };
}

function playerAction(param_0, param_1) {
  return {
          TAG: /* PlayerAction */4,
          _0: param_0,
          _1: param_1
        };
}

function bulletHit(param_0, param_1) {
  return {
          TAG: /* BulletHit */5,
          _0: param_0,
          _1: param_1
        };
}

function make(param) {
  return {
          state: /* Preparing */0,
          players: [],
          bullets: /* [] */0
        };
}

function step(t, action) {
  if (typeof action === "number") {
    if (action === /* Start */0) {
      return {
              state: /* Playing */1,
              players: t.players,
              bullets: t.bullets
            };
    } else {
      return {
              state: t.state,
              players: Belt_Array.map(t.players, (function (__x) {
                      return Player$Netgame.step(__x, /* Tick */0);
                    })),
              bullets: t.bullets
            };
    }
  }
  switch (action.TAG | 0) {
    case /* AddPlayers */0 :
        return {
                state: t.state,
                players: Belt_Array.concat(t.players, action._0),
                bullets: t.bullets
              };
    case /* RemovePlayer */1 :
        var id = action._0;
        return {
                state: t.state,
                players: Belt_Array.keep(t.players, (function (p) {
                        return p.id !== id;
                      })),
                bullets: t.bullets
              };
    case /* AddBullet */2 :
        return {
                state: t.state,
                players: t.players,
                bullets: Belt_List.add(t.bullets, action._0)
              };
    case /* RemoveBullet */3 :
        var id$1 = action._0;
        return {
                state: t.state,
                players: t.players,
                bullets: Belt_List.keep(t.bullets, (function (b) {
                        return b.id !== id$1;
                      }))
              };
    case /* PlayerAction */4 :
        var action$1 = action._1;
        var id$2 = action._0;
        return {
                state: t.state,
                players: Belt_Array.map(t.players, (function (p) {
                        if (p.id === id$2) {
                          return Player$Netgame.step(p, action$1);
                        } else {
                          return p;
                        }
                      })),
                bullets: t.bullets
              };
    case /* BulletHit */5 :
        var bid = action._0;
        try {
          var bullet = Belt_List.headExn(Belt_List.keep(t.bullets, (function (b) {
                      return b.id === bid;
                    })));
          return step(step(t, {
                          TAG: /* RemoveBullet */3,
                          _0: bid
                        }), {
                      TAG: /* PlayerAction */4,
                      _0: action._1,
                      _1: {
                        TAG: /* MapHp */0,
                        _0: (function (hp) {
                            return hp - bullet.damage | 0;
                          })
                      }
                    });
        }
        catch (exn){
          return Utils$Netgame.effect(t, (console.log("| BulletHit => bullet not found"), undefined));
        }
    
  }
}

function findPlayer(t, id) {
  return Caml_option.undefined_to_opt(t.players.find(function (p) {
                  return p.id === id;
                }));
}

function playersMap(t, fn) {
  return Belt_Array.mapU(t.players, fn);
}

function playersForEach(t, fn) {
  return Belt_Array.forEachU(t.players, fn);
}

function bulletsMap(t, fn) {
  return Belt_List.mapU(t.bullets, fn);
}

function bulletForEach(t, fn) {
  return Belt_List.forEachU(t.bullets, fn);
}

var Helper = {
  findPlayer: findPlayer,
  playersMap: playersMap,
  playersForEach: playersForEach,
  bulletsMap: bulletsMap,
  bulletForEach: bulletForEach
};

var start = /* Start */0;

var tick = /* Tick */1;

exports.start = start;
exports.tick = tick;
exports.addPlayers = addPlayers;
exports.removePlayer = removePlayer;
exports.addBullet = addBullet;
exports.removeBullet = removeBullet;
exports.playerAction = playerAction;
exports.bulletHit = bulletHit;
exports.make = make;
exports.step = step;
exports.Helper = Helper;
/* No side effect */