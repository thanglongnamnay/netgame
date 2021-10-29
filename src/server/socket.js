"use strict";
require("util").inspect.defaultOptions.depth = 9;
const flatbuffers = require("flatbuffers");
const dgram = require("dgram");
const { ClientSend } = require("../flat-models/client-send");
const { ServerSendT } = require("../flat-models/server-send");
const ServerRoom = require("../common/ServerRoom.bs");
const converter = require("../converter");
const server = dgram.createSocket('udp4');
const PLAYER_COUNT = 2;
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
server.on('listening', function () {
    const address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});
server.on('message', function (msg, rinfo) {
    rooms.forEach(room => room.onMessage(msg, rinfo));
});
server.bind(41234);
const nextId = (() => {
    let id = 0;
    return () => ++id;
})();
const makeRoom = () => {
    let t = ServerRoom.nope(PLAYER_COUNT);
    const rinfoMap = [];
    const interval = setInterval(function update() {
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

    return {
        id: nextId(),
        destroy() {
            clearInterval(interval);
        },
        onMessage(msg, rinfo) {
            const clientSendObj = ClientSend.getRootAsClientSend(new flatbuffers.ByteBuffer(msg)).unpack();
            if (!rinfoMap[clientSendObj.myIndex]) rinfoMap[clientSendObj.myIndex] = rinfo;
            const clientSent = {
                myIndex: clientSendObj.myIndex,
                myFrames: converter.rframes(clientSendObj.myFrames),
                otherAcks: clientSendObj.otherAcks,
            }
            console.log("server got from " + rinfo.address + ":" + rinfo.port, clientSendObj, clientSent);

            t = ServerRoom.step(t, ServerRoom.receive(clientSent));
        }
    }
}
const destroyRoom = room => {
    room.destroy();
    rooms = rooms.filter(r => r !== room);
}
let rooms = [];
rooms.push(makeRoom());