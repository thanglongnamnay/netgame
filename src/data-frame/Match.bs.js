// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("@rescript/std/lib/js/curry.js");
var Belt_MapInt = require("@rescript/std/lib/js/belt_MapInt.js");
var PlayerData$Netgame = require("./PlayerData.bs.js");

var newMatch_players = Belt_MapInt.fromArray([]);

var newMatch = {
  status: /* Preparing */0,
  players: newMatch_players
};

function mapPlayer(t, id, fn) {
  var players = t.players;
  var v = Belt_MapInt.get(players, id);
  var players$1 = v !== undefined ? Belt_MapInt.set(players, id, Curry._1(fn, v)) : players;
  return {
          status: t.status,
          players: players$1
        };
}

function mapPlayers(t, fn) {
  return {
          status: t.status,
          players: Curry._1(fn, t.players)
        };
}

function doWhilePreparing(t, fn) {
  var match = t.status;
  if (match) {
    return t;
  } else {
    return Curry._1(fn, t);
  }
}

function step(t, action) {
  if (typeof action === "number") {
    return {
            status: /* Playing */1,
            players: t.players
          };
  }
  switch (action.TAG | 0) {
    case /* AddPlayer */0 :
        var player = action._0;
        return doWhilePreparing(t, (function (__x) {
                      return mapPlayers(__x, (function (__x) {
                                    return Belt_MapInt.set(__x, player.id, player);
                                  }));
                    }));
    case /* RemovePlayer */1 :
        var id = action._0;
        return mapPlayers(t, (function (__x) {
                      return Belt_MapInt.remove(__x, id);
                    }));
    case /* PlayerData */2 :
        var action$1 = action._1;
        return mapPlayer(t, action._0, (function (__x) {
                      return PlayerData$Netgame.step(__x, action$1);
                    }));
    
  }
}

exports.newMatch = newMatch;
exports.mapPlayer = mapPlayer;
exports.mapPlayers = mapPlayers;
exports.doWhilePreparing = doWhilePreparing;
exports.step = step;
/* newMatch Not a pure module */