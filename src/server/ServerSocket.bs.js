// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Dgram = require("dgram");
var Belt_Array = require("@rescript/std/lib/js/belt_Array.js");
var Belt_HashMapInt = require("@rescript/std/lib/js/belt_HashMapInt.js");
var Rebuffers$Netgame = require("../lib/Rebuffers.bs.js");
var ClientData$Netgame = require("../data-frame/ClientData.bs.js");
var ServerRoom$Netgame = require("../data-frame/ServerRoom.bs.js");

var server = Dgram.createSocket("udp4");

var t = {
  contents: ServerRoom$Netgame.nope(2)
};

var rinfoMap = Belt_HashMapInt.make(2);

server.on("error", (function (err) {
              console.log("Socket error", err);
              server.close(undefined);
              
            })).on("listening", (function (param) {
            console.log("Socket listening");
            
          })).on("message", (function (msg, rinfo) {
          var data = ClientData$Netgame.deserializeSend(Rebuffers$Netgame.read(msg, ClientData$Netgame.sendSchema(undefined)));
          console.log("server got", rinfo, data);
          Belt_HashMapInt.set(rinfoMap, data.myIndex, rinfo);
          t.contents = ServerRoom$Netgame.step(t.contents, /* Receive */{
                _0: data
              });
          
        })).bind(41234, undefined, undefined);

setInterval((function (param) {
        return Belt_Array.forEachWithIndex(ServerRoom$Netgame.getSendData(t.contents), (function (playerIndex, sendData) {
                      var rinfo = Belt_HashMapInt.get(rinfoMap, playerIndex);
                      if (rinfo !== undefined) {
                        var pack = Rebuffers$Netgame.pack(ClientData$Netgame.serializeReceive(sendData));
                        server.send(pack, rinfo.port, rinfo.address, undefined);
                        return ;
                      }
                      console.log("wtf?");
                      
                    }));
      }), 1000 / 1);

server.bind(41234, undefined, undefined);

var playerCount = 2;

exports.server = server;
exports.playerCount = playerCount;
exports.t = t;
exports.rinfoMap = rinfoMap;
/* server Not a pure module */
