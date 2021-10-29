"use strict";
const socket = require("./socket");
const ClientData = require("../common/ClientData.bs");
const { ClientSendT } = require("../flat-models/client-send");
const Game = require("../game/index");
const converter = require("../converter");

const PLAYER_COUNT = 2;
const colors = ['white', 'green', 'blue', 'cyan'];
const stringify = v => JSON.stringify(v, null, 2);
const draw = (playerIndex, payload, ctx) => {
    if (!(payload.touches | 1)) return;
    ctx.beginPath();
    const pos = payload.touchPos;
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = colors[playerIndex];
    ctx.fill();
}
const client = (myIndex, playerCount, canvas) => {
    const log = console.log.bind(console, "client", myIndex);
    // const log = () => { };
    canvas.style.backgroundColor = colors[3 - myIndex];

    let curTouch = 0;
    let curPos = { x: 0, y: 0 };
    canvas.onmouseout = e => {
        curTouch = 0;
    }
    canvas.onmouseup = e => {
        curTouch = 0;
    }
    canvas.onmousemove = e => {
        const rect = canvas.getBoundingClientRect();
        curTouch = e.buttons;
        curPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
    let currentKeys = new Set();
    const toKeyCode = e => {
        switch (e.code) {
            case "KeyS":
            case "ArrowDown":
                return 's'.charCodeAt(0);
            case "KeyW":
            case "ArrowUp":
                return 'w'.charCodeAt(0);
            case "KeyA":
            case "ArrowLeft":
                return 'a'.charCodeAt(0);
            case "KeyD":
            case "ArrowRight":
                return 'd'.charCodeAt(0);
        }
    }
    window.addEventListener('keydown', function (evt) {
        console.log("onkeydown", evt.code);
        currentKeys.add(toKeyCode(evt));
    });
    window.addEventListener('keyup', e => {
        console.log("onkeyup", e.code);
        currentKeys.delete(toKeyCode(e));
    });
    const getCurrentInput = () => {
        const keys = Array.from(currentKeys.values());
        return {
            touches: curTouch,
            touchPos: curPos,
            keys,
        }
    }

    const gameLoop = Game.make(playerCount, canvas);
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
        t = ClientData.step(t, ClientData.addFrame(getCurrentInput()));
        try {
            const payloads = ClientData.getFirstFrames(t);
            log("payloads Draw", payloads);
            gameLoop(dt, payloads);
            // payloads.forEach((payload, index) => draw(index, payload, ctx));
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
    }, 1000 / 1);

    const dt = 1000 / 3;
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
    const canvasList = Array(PLAYER_COUNT).fill(0).map(() => document.createElement('canvas'));
    canvasList.forEach(canvas => {
        canvas.width = 400;
        canvas.height = 300;
        document.body.appendChild(canvas);
    });
    canvasList.forEach((canvas, i) => client(i, PLAYER_COUNT, canvas));
});