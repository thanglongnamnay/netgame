"use strict";
require("util").inspect.defaultOptions.depth = 9;
exports.__esModule = true;
const flatbuffers = require("flatbuffers");
const dgram = require("dgram");
const { ClientSend } = require("../flat-models/client-send");
const { ServerSendT } = require("../flat-models/server-send");
const ServerRoom = require("../common/ServerRoom.bs");
const converter = require("../converter");
const server = dgram.createSocket('udp4');
/**
 * 
 * @param {*} rinfo 
 * @param {ServerSendT} sendObj 
 */
const send = function (rinfo, sendObj) {
    // fbb.clear();
    const fbb = new flatbuffers.Builder(1);
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
        const sendDatas = ServerRoom.getSendData(t);
        console.log("update", t, sendDatas);
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
}, 1000 / 10);
server.on('message', function (msg, rinfo) {
    const clientSendObj = ClientSend.getRootAsClientSend(new flatbuffers.ByteBuffer(msg)).unpack();
    if (!rinfoMap[clientSendObj.myIndex]) rinfoMap[clientSendObj.myIndex] = rinfo;
    const clientSent = {
        myIndex: clientSendObj.myIndex,
        myFrames: converter.rframes(clientSendObj.myFrames),
        otherAcks: clientSendObj.otherAcks,
    }
    console.log("server got from " + rinfo.address + ":" + rinfo.port, clientSendObj, clientSent);

    t = ServerRoom.step(t, ServerRoom.receive(clientSent));
});
server.on('listening', function () {
    const address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});
server.bind(41234);
//# sourceMappingURL=socket.js.map