"use strict";
exports.__esModule = true;
exports.ServerSendT = exports.ServerSend = void 0;
var flatbuffers = require("flatbuffers");
var frames_1 = require("./frames");
var ServerSend = (function () {
    function ServerSend() {
        this.bb = null;
        this.bb_pos = 0;
    }
    ServerSend.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    ServerSend.getRootAsServerSend = function (bb, obj) {
        return (obj || new ServerSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    ServerSend.getSizePrefixedRootAsServerSend = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ServerSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    ServerSend.prototype.serverAck = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    ServerSend.prototype.players = function (index, obj) {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new frames_1.Frames()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    };
    ServerSend.prototype.playersLength = function () {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    };
    ServerSend.prototype.custom = function () {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : -69;
    };
    ServerSend.startServerSend = function (builder) {
        builder.startObject(3);
    };
    ServerSend.addServerAck = function (builder, serverAck) {
        builder.addFieldInt32(0, serverAck, 0);
    };
    ServerSend.addPlayers = function (builder, playersOffset) {
        builder.addFieldOffset(1, playersOffset, 0);
    };
    ServerSend.createPlayersVector = function (builder, data) {
        builder.startVector(4, data.length, 4);
        for (var i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    };
    ServerSend.startPlayersVector = function (builder, numElems) {
        builder.startVector(4, numElems, 4);
    };
    ServerSend.addCustom = function (builder, custom) {
        builder.addFieldInt32(2, custom, -69);
    };
    ServerSend.endServerSend = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    ServerSend.createServerSend = function (builder, serverAck, playersOffset, custom) {
        ServerSend.startServerSend(builder);
        ServerSend.addServerAck(builder, serverAck);
        ServerSend.addPlayers(builder, playersOffset);
        ServerSend.addCustom(builder, custom);
        return ServerSend.endServerSend(builder);
    };
    ServerSend.prototype.unpack = function () {
        return new ServerSendT(this.serverAck(), this.bb.createObjList(this.players.bind(this), this.playersLength()), this.custom());
    };
    ServerSend.prototype.unpackTo = function (_o) {
        _o.serverAck = this.serverAck();
        _o.players = this.bb.createObjList(this.players.bind(this), this.playersLength());
        _o.custom = this.custom();
    };
    return ServerSend;
}());
exports.ServerSend = ServerSend;
var ServerSendT = (function () {
    function ServerSendT(serverAck, players, custom) {
        if (serverAck === void 0) { serverAck = 0; }
        if (players === void 0) { players = []; }
        if (custom === void 0) { custom = -69; }
        this.serverAck = serverAck;
        this.players = players;
        this.custom = custom;
    }
    ServerSendT.prototype.pack = function (builder) {
        var players = ServerSend.createPlayersVector(builder, builder.createObjectOffsetList(this.players));
        return ServerSend.createServerSend(builder, this.serverAck, players, this.custom);
    };
    return ServerSendT;
}());
exports.ServerSendT = ServerSendT;
//# sourceMappingURL=server-send.js.map