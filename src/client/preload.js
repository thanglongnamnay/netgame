"use strict";
const Touch = require("../common/Touch.bs");
const socket = require("./socket");
const ClientData = require("../common/ClientData.bs");
const { ClientSendT } = require("../flat-models/client-send");
const converter = require("../converter");
const { createClassifier } = require("typescript");

const colors = ['white', 'green', 'blue', 'cyan'];
const stringify = v => JSON.stringify(v, null, 2);
const draw = (playerIndex, payload, ctx) => {
    if (Touch.isMouseUp(payload.touch)) return;
    ctx.beginPath();
    const pos = Touch.getPos(payload.touch);
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = colors[playerIndex];
    ctx.fill();
}
const client = (myIndex, playerCount, canvas) => {
    const log = console.log.bind(console, "client", myIndex);
    canvas.style.backgroundColor = colors[3 - myIndex];
    let curTouch = 0;
    let curPos = { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    canvas.onmouseout = e => {
        curTouch = 0;
    }
    canvas.onmousemove = e => {
        curTouch = e.buttons | 1;
        curPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
    const ctx = canvas.getContext('2d');
    let t = ClientData.nope(myIndex, playerCount);
    const client = socket.create((receiveObj) => {
        const receiveData = {
            serverAck: receiveObj.serverAck,
            players: receiveObj.players.map(converter.rframes),
        }
        t = ClientData.step(t, ClientData.receive(receiveData));
        log("receive", stringify(receiveData));
    });
    const step = () => {
        log("update or fuckyou", stringify(t), curPos);
        t = ClientData.step(t, ClientData.addFrame({
            touch: curTouch === Touch.up ? Touch.up : Touch.down(curPos)
        }));
        try {
            const payloads = ClientData.getFirstFrames(t);
            log("payloads Draw", payloads);
            payloads.forEach((payload, index) => draw(index, payload, ctx));
            t = ClientData.step(t, ClientData.consume);
        } catch (e) {
            log(stringify(e), "but it's ok");
        }
    }
    setInterval(() => {
        try {
            const sendData = ClientData.getSendData(t);
            const sendObj = new ClientSendT(
                sendData.myIndex,
                converter.frames(sendData.myFrames),
                sendData.otherAcks,
            )
            socket.send(client, sendObj);
            log("send", stringify(sendObj));
        } catch (e) {
            log(stringify(e), 'its ok');
        }
    }, 1000 / 10);

    const dt = 1000 / 30;
    let accumulateTime = 0;
    let time = 0;
    requestAnimationFrame(function update(now) {
        requestAnimationFrame(update)
        accumulateTime += now - time;
        while (accumulateTime > dt) {
            step();
            accumulateTime -= dt;
        }

        time = now;
    });

    return client;
}
window.addEventListener('DOMContentLoaded', function () {
    const replaceText = function (selector, text) {
        const element = document.getElementById(selector);
        if (element)
            element.innerText = text;
    };
    for (let _i = 0, _a = ['chrome', 'node', 'electron']; _i < _a.length; _i++) {
        const type = _a[_i];
        replaceText(type + "-version", process.versions[type]);
    }
    const canvas = ['canvas0', 'canvas1'].map(c => document.getElementById(c));
    client(0, 2, canvas[0]);
    client(1, 2, canvas[1]);
});