"use strict";
exports.__esModule = true;
exports.ClientDataT = exports.ClientData = void 0;
var flatbuffers = require("flatbuffers");
var frames_1 = require("./frames");
var ClientData = (function () {
    function ClientData() {
        this.bb = null;
        this.bb_pos = 0;
    }
    ClientData.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    ClientData.getRootAsClientData = function (bb, obj) {
        return (obj || new ClientData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    ClientData.getSizePrefixedRootAsClientData = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ClientData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    ClientData.prototype.myIndex = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    ClientData.prototype.playersFrames = function (index, obj) {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new frames_1.Frames()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    };
    ClientData.prototype.playersFramesLength = function () {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    };
    ClientData.prototype.serverAck = function () {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    ClientData.startClientData = function (builder) {
        builder.startObject(3);
    };
    ClientData.addMyIndex = function (builder, myIndex) {
        builder.addFieldInt32(0, myIndex, 0);
    };
    ClientData.addPlayersFrames = function (builder, playersFramesOffset) {
        builder.addFieldOffset(1, playersFramesOffset, 0);
    };
    ClientData.createPlayersFramesVector = function (builder, data) {
        builder.startVector(4, data.length, 4);
        for (var i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    };
    ClientData.startPlayersFramesVector = function (builder, numElems) {
        builder.startVector(4, numElems, 4);
    };
    ClientData.addServerAck = function (builder, serverAck) {
        builder.addFieldInt32(2, serverAck, 0);
    };
    ClientData.endClientData = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    ClientData.createClientData = function (builder, myIndex, playersFramesOffset, serverAck) {
        ClientData.startClientData(builder);
        ClientData.addMyIndex(builder, myIndex);
        ClientData.addPlayersFrames(builder, playersFramesOffset);
        ClientData.addServerAck(builder, serverAck);
        return ClientData.endClientData(builder);
    };
    ClientData.prototype.unpack = function () {
        return new ClientDataT(this.myIndex(), this.bb.createObjList(this.playersFrames.bind(this), this.playersFramesLength()), this.serverAck());
    };
    ClientData.prototype.unpackTo = function (_o) {
        _o.myIndex = this.myIndex();
        _o.playersFrames = this.bb.createObjList(this.playersFrames.bind(this), this.playersFramesLength());
        _o.serverAck = this.serverAck();
    };
    return ClientData;
}());
exports.ClientData = ClientData;
var ClientDataT = (function () {
    function ClientDataT(myIndex, playersFrames, serverAck) {
        if (myIndex === void 0) { myIndex = 0; }
        if (playersFrames === void 0) { playersFrames = []; }
        if (serverAck === void 0) { serverAck = 0; }
        this.myIndex = myIndex;
        this.playersFrames = playersFrames;
        this.serverAck = serverAck;
    }
    ClientDataT.prototype.pack = function (builder) {
        var playersFrames = ClientData.createPlayersFramesVector(builder, builder.createObjectOffsetList(this.playersFrames));
        return ClientData.createClientData(builder, this.myIndex, playersFrames, this.serverAck);
    };
    return ClientDataT;
}());
exports.ClientDataT = ClientDataT;
//# sourceMappingURL=client-data.js.map