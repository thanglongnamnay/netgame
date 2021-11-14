"use strict";
require("util").inspect.defaultOptions.depth = 9;
const flatbuffers = require("flatbuffers");
const dgram = require("dgram");
const ClientData = require("../data-frame/ClientRoom.bs");
const ServerRoom = require("../data-frame/ServerRoom.bs");
const { startGame } = require("./game");
const server = dgram.createSocket('udp4');
const constants = require("../constants");

const PLAYER_COUNT = 2;
const sendRaw = (rinfo, sendData) => {
    server.send(sendData, rinfo.port, rinfo.address);
}
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
            const sendDatas = ServerRoom.getSendDataRaw(t);
            // console.log("update", t, sendDatas);
            sendDatas.forEach((sendData, playerIndex) => {
                const rinfo = rinfoMap[playerIndex];
                sendRaw(rinfo, sendData);
            });
        } catch (e) {
            console.log(e, t, "but it's ok.");
        }
    }, 1000 / 10);
    const stepInterval = setInterval(() => {
        while (tryStep());
    }, 1000);

    return {
        id,
        destroy,
        onMessage(msg, rinfo) {
            const clientSent = ClientData.readSend(msg);
            if (!rinfoMap[clientSent.myIndex]) rinfoMap[clientSent.myIndex] = rinfo;
            // console.log("server got from " + rinfo.address + ":" + rinfo.port, clientSent.myIndex);
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