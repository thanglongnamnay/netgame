"use strict";
exports.__esModule = true;
exports.sendRaw = exports.create = void 0;
var flatbuffers = require("flatbuffers");
var dgram = require("dgram");
var constants = require("../constants");
var create = function (cb) {
    var client = dgram.createSocket('udp4');
    client.on('error', function (err) {
        console.log("client error:\n" + err.stack);
        client.close();
        client.send = function () { };
    });
    client.on('message', function (msg, rinfo) {
        cb(msg);
    });
    client.connect(8081, constants.host);
    return client;
};
exports.create = create;
var fbb = new flatbuffers.Builder(1);
var sendRaw = function (client, index, data) {
    var id = Buffer.allocUnsafe(4);
    id.writeInt32LE(index, 0);
    client.send(Buffer.concat([id, data]));
};
exports.sendRaw = sendRaw;
//# sourceMappingURL=socket.js.map