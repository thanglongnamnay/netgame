"use strict";
require("util").inspect.defaultOptions.depth = 9;
const flatbuffers = require("flatbuffers");
const dgram = require("dgram");
const { ClientSend } = require("../flat-models/client-send");
const { ServerSendT } = require("../flat-models/server-send");
const ServerRoom = require("../data-frame/ServerRoom.bs");
const converter = require("../converter");
const { startGame } = require("./game");
const server = dgram.createSocket('udp4');
const constants = require("../constants");

const PLAYER_COUNT = 2;
const send = function (rinfo, sendObj) {
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
    // console.log('server got message', rinfo);
    rooms.filter(r => r.id === msg.readInt32LE(0)).forEach(room => room.onMessage(msg.slice(4), rinfo));
});
server.bind(8081);
const makeRoom = (info) => {
    const { id } = info;
    const destroy = () => {
        console.log("end game");
        clearInterval(updateInterval);
        clearInterval(stepInterval);
    };
    const gameStep = startGame(info, destroy);
    let t = ServerRoom.nope(PLAYER_COUNT);
    let currentFrame = 0;
    const tryStep = () => {
        try {
            const frames = ServerRoom.getFramesAt(t, currentFrame);
            gameStep(frames);
            currentFrame++;
            return true;
        } catch (e) {
            return false;
            // console.log("step failed", e);
        }
    }
    const rinfoMap = [];
    const updateInterval = setInterval(function update() {
        try {
            const sendDatas = ServerRoom.getSendData(t);
            // console.log("update", t, sendDatas);
            sendDatas.forEach((sendData, playerIndex) => {
                const rinfo = rinfoMap[playerIndex];
                const sendObj = new ServerSendT(
                    sendData.serverAck,
                    sendData.players.map(converter.frames),
                    Math.random() * 1000 | 0,
                );
                // console.log("sendData", playerIndex, rinfo, sendObj)
                send(rinfo, sendObj);
            });
        } catch (e) {
            // console.log(e, t, "but it's ok.");
        }
    }, 1000 / 10);
    const stepInterval = setInterval(() => {
        while (tryStep());
    }, 1000);

    return {
        id,
        destroy,
        onMessage(msg, rinfo) {
            const clientSendObj = ClientSend.getRootAsClientSend(new flatbuffers.ByteBuffer(msg)).unpack();
            if (!rinfoMap[clientSendObj.myIndex]) rinfoMap[clientSendObj.myIndex] = rinfo;
            const clientSent = {
                myIndex: clientSendObj.myIndex,
                myFrames: converter.rframes(clientSendObj.myFrames),
                otherAcks: clientSendObj.otherAcks,
            }
            // console.log("server got from " + rinfo.address + ":" + rinfo.port, clientSendObj.myIndex);

            t = ServerRoom.step(t, ServerRoom.receive(clientSent));
        }
    }
}
const destroyRoom = room => {
    room.destroy();
    rooms = rooms.filter(r => r !== room);
}
let rooms = [];

const addRoom = info => {
    const room = makeRoom(info)
    rooms.push(room);
}
process.on('message', msg => {
    console.log("child got", msg);
    if (msg.id === constants.makeRoom) {
        console.log("making room");
        addRoom(msg.info);
    }
});