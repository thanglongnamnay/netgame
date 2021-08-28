"use strict";
require("util").inspect.defaultOptions.depth = 4;
exports.__esModule = true;
const flatbuffers = require("flatbuffers");
const dgram = require("dgram");
const { ClientSend } = require("../flat-models/client-send");
const { ServerSendT } = require("../flat-models/server-send");
const ServerRoom = require("../common/ServerRoom.bs");
const converter = require("../flat-models/converter");
const server = dgram.createSocket('udp4');
const send = function (rinfo, sendObj) {
  fbb.clear();
  fbb.finish(sendObj.pack(fbb));
  server.send(fbb.asUint8Array(), rinfo.port, rinfo.address);
};
server.on('error', function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});
let t = ServerRoom.nope(2);
const rinfoMap = [];
setInterval(function update() {
  try {
    console.log("update", t);
    const sendDatas = ServerRoom.getSendData(t);
    sendDatas.forEach((sendData, playerIndex) => {
      const rinfo = rinfoMap[playerIndex];
      const sendObj = new ServerSendT(
        sendData.serverAck,
        sendData.players.map(converter.frames),
        Math.random() * 1000 | 0,
      );
      console.log("sendData", playerIndex, rinfo, sendObj)
      send(rinfo, sendObj);
    });
  } catch (e) {
    console.log(e.message, "but it's ok.");
  }
}, 1000 / 1);
server.on('message', function (msg, rinfo) {
  const clientSendObj = ClientSend.getRootAsClientSend(new flatbuffers.ByteBuffer(msg)).unpack();
  console.log("server got from " + rinfo.address + ":" + rinfo.port, clientSendObj);
  if (!rinfoMap[clientSendObj.myIndex]) rinfoMap[clientSendObj.myIndex] = rinfo;
  t = ServerRoom.step(t, ServerRoom.receive(clientSendObj));
});
server.on('listening', function () {
  const address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});
server.bind(41234);
//# sourceMappingURL=socket.js.map