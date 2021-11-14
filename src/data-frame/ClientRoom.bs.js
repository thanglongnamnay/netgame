// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Belt_Array = require("@rescript/std/lib/js/belt_Array.js");
var Belt_Option = require("@rescript/std/lib/js/belt_Option.js");
var Array$Netgame = require("../lib/Array.bs.js");
var Frames$Netgame = require("./Frames.bs.js");
var Payload$Netgame = require("./Payload.bs.js");
var ImmuArray$Netgame = require("../lib/ImmuArray.bs.js");
var Rebuffers$Netgame = require("../lib/Rebuffers.bs.js");

function serializeSend(t) {
  return {
          TAG: /* Schema */6,
          _0: [
            {
              TAG: /* Int */3,
              _0: t.myIndex
            },
            Frames$Netgame.serialize(t.myFrames),
            {
              TAG: /* Array */5,
              _0: Rebuffers$Netgame.toList(t.otherAcks, (function (ack) {
                      return {
                              TAG: /* Int */3,
                              _0: ack
                            };
                    }))
            }
          ]
        };
}

var sendSchema = serializeSend({
      myIndex: 0,
      myFrames: {
        end: 0,
        payloads: ImmuArray$Netgame.make([Payload$Netgame.nope])
      },
      otherAcks: [0]
    });

function deserializeSend(schema) {
  if (schema.TAG === /* Schema */6) {
    var match = schema._0;
    if (match.length !== 3) {
      throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
    }
    var myIndex = match[0];
    if (myIndex.TAG === /* Int */3) {
      var myFrames = match[1];
      var otherAcks = match[2];
      return {
              myIndex: myIndex._0,
              myFrames: Frames$Netgame.deserialize(myFrames),
              otherAcks: Rebuffers$Netgame.deserialize(otherAcks, {
                    TAG: /* Array */0,
                    _0: /* Int */3
                  })
            };
    }
    throw {
          RE_EXN_ID: "Not_found",
          Error: new Error()
        };
  }
  throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
}

function serializeReceive(t) {
  return {
          TAG: /* Schema */6,
          _0: [
            {
              TAG: /* Int */3,
              _0: t.serverAck
            },
            {
              TAG: /* Array */5,
              _0: Rebuffers$Netgame.toList(t.players, Frames$Netgame.serialize)
            }
          ]
        };
}

var receiveSchema = serializeReceive({
      serverAck: 0,
      players: [Frames$Netgame.create(10, ImmuArray$Netgame.make([Payload$Netgame.nope]))]
    });

function deserializeReceive(schema) {
  if (schema.TAG === /* Schema */6) {
    var match = schema._0;
    if (match.length !== 2) {
      throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
    }
    var serverAck = match[0];
    if (serverAck.TAG === /* Int */3) {
      var players = match[1];
      return {
              serverAck: serverAck._0,
              players: Rebuffers$Netgame.deserialize(players, {
                    TAG: /* List */1,
                    _0: Frames$Netgame.deserialize
                  })
            };
    }
    throw {
          RE_EXN_ID: "Not_found",
          Error: new Error()
        };
  }
  throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
}

function receive(param_0) {
  return {
          TAG: /* Receive */0,
          _0: param_0
        };
}

function addFrame(param_0) {
  return {
          TAG: /* AddFrame */1,
          _0: param_0
        };
}

function nope(myIndex, playerCount) {
  return {
          myIndex: myIndex,
          playersFrames: Belt_Array.make(playerCount, Frames$Netgame.nope(undefined)),
          serverAck: -1
        };
}

function getFirstFrames(t) {
  return Belt_Array.map(t.playersFrames, (function (frames) {
                return Belt_Option.getExn(Frames$Netgame.getFirstFrame(frames));
              }));
}

function getSendData(t) {
  return {
          myIndex: t.myIndex,
          myFrames: Belt_Array.getExn(t.playersFrames, t.myIndex),
          otherAcks: Belt_Array.map(t.playersFrames, (function (frames) {
                  return frames.end;
                }))
        };
}

function packSend(sendData) {
  return Rebuffers$Netgame.pack(serializeSend(sendData));
}

function packReceive(receiveData) {
  return Rebuffers$Netgame.pack(serializeReceive(receiveData));
}

function readSend(buffer) {
  return deserializeSend(Rebuffers$Netgame.read(buffer, sendSchema));
}

function readReceive(buffer) {
  return deserializeReceive(Rebuffers$Netgame.read(buffer, receiveSchema));
}

function getSendDataRaw(t) {
  var sendData = getSendData(t);
  return Rebuffers$Netgame.pack(serializeSend(sendData));
}

function step(t, action) {
  if (typeof action === "number") {
    return {
            myIndex: t.myIndex,
            playersFrames: Belt_Array.map(t.playersFrames, (function (__x) {
                    return Frames$Netgame.step(__x, /* Shift */0);
                  })),
            serverAck: t.serverAck
          };
  }
  if (action.TAG === /* Receive */0) {
    var data = action._0;
    return {
            myIndex: t.myIndex,
            playersFrames: Belt_Array.map(Belt_Array.zip(t.playersFrames, data.players), (function (param) {
                    return Frames$Netgame.step(param[0], {
                                TAG: /* Concat */0,
                                _0: param[1]
                              });
                  })),
            serverAck: data.serverAck
          };
  }
  var payload = action._0;
  return {
          myIndex: t.myIndex,
          playersFrames: Array$Netgame.set(t.playersFrames, t.myIndex, (function (__x) {
                  return Frames$Netgame.step(__x, {
                              TAG: /* AddPayload */2,
                              _0: payload
                            });
                })),
          serverAck: t.serverAck
        };
}

var consume = /* Consume */0;

exports.serializeSend = serializeSend;
exports.sendSchema = sendSchema;
exports.deserializeSend = deserializeSend;
exports.serializeReceive = serializeReceive;
exports.receiveSchema = receiveSchema;
exports.deserializeReceive = deserializeReceive;
exports.receive = receive;
exports.consume = consume;
exports.addFrame = addFrame;
exports.nope = nope;
exports.getFirstFrames = getFirstFrames;
exports.getSendData = getSendData;
exports.packSend = packSend;
exports.packReceive = packReceive;
exports.readSend = readSend;
exports.readReceive = readReceive;
exports.getSendDataRaw = getSendDataRaw;
exports.step = step;
/* sendSchema Not a pure module */