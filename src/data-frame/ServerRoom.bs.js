// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Caml_obj = require("@rescript/std/lib/js/caml_obj.js");
var Belt_Array = require("@rescript/std/lib/js/belt_Array.js");
var Belt_Option = require("@rescript/std/lib/js/belt_Option.js");
var Array$Netgame = require("../lib/Array.bs.js");
var Frames$Netgame = require("./Frames.bs.js");

function receive(param_0) {
  return /* Receive */{
          _0: param_0
        };
}

function nope(playerCount) {
  return {
          id: 0,
          players: Belt_Array.make(playerCount, {
                acks: [],
                frames: Frames$Netgame.nope(undefined)
              })
        };
}

function getSendData(t) {
  return Belt_Array.map(t.players, (function (player) {
                return {
                        serverAck: player.frames.end,
                        players: Belt_Array.mapWithIndex(t.players, (function (i, p) {
                                if (Caml_obj.caml_notequal(p, player)) {
                                  return Frames$Netgame.step(p.frames, {
                                              TAG: /* RemoveFrom */1,
                                              _0: Belt_Array.getExn(player.acks, i)
                                            });
                                } else {
                                  return Frames$Netgame.nope(undefined);
                                }
                              }))
                      };
              }));
}

function step(t, action) {
  var data = action._0;
  return {
          id: t.id,
          players: Array$Netgame.set(t.players, data.myIndex, (function (player) {
                  return {
                          acks: data.otherAcks,
                          frames: Frames$Netgame.step(player.frames, {
                                TAG: /* Concat */0,
                                _0: data.myFrames
                              })
                        };
                }))
        };
}

function getFirstFrames(t) {
  return Belt_Array.map(Belt_Array.map(Belt_Array.map(t.players, (function (p) {
                        return p.frames;
                      })), Frames$Netgame.getFirstFrame), Belt_Option.getExn);
}

exports.receive = receive;
exports.nope = nope;
exports.getSendData = getSendData;
exports.step = step;
exports.getFirstFrames = getFirstFrames;
/* No side effect */
