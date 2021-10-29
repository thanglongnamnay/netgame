"use strict";
exports.__esModule = true;
exports.send = exports.create = void 0;
var flatbuffers = require("flatbuffers");
var dgram = require("dgram");
var server_send_1 = require("../flat-models/server-send");
var create = function (cb) {
    var client = dgram.createSocket('udp4');
    client.on('error', function (err) {
        console.log("client error:\n" + err.stack);
        client.close();
    });
    client.on('message', function (msg, rinfo) {
        var receiveObj = server_send_1.ServerSend.getRootAsServerSend(new flatbuffers.ByteBuffer(msg)).unpack();
        cb(receiveObj);
    });
    client.connect(41234);
    return client;
};
exports.create = create;
var fbb = new flatbuffers.Builder(1);
var send = function (client, sendObj) {
    fbb.clear();
    fbb.finish(sendObj.pack(fbb));
    client.send(fbb.asUint8Array());
};
exports.send = send;
//# sourceMappingURL=socket.js.map