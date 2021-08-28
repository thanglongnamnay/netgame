"use strict";
exports.__esModule = true;
exports.ClientSendT = exports.ClientSend = void 0;
var flatbuffers = require("flatbuffers");
var frames_1 = require("./frames");
var ClientSend = (function () {
    function ClientSend() {
        this.bb = null;
        this.bb_pos = 0;
    }
    ClientSend.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    ClientSend.getRootAsClientSend = function (bb, obj) {
        return (obj || new ClientSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    ClientSend.getSizePrefixedRootAsClientSend = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ClientSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    ClientSend.prototype.myIndex = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    ClientSend.prototype.myFrames = function (obj) {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new frames_1.Frames()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    };
    ClientSend.prototype.otherAcks = function (index) {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
    };
    ClientSend.prototype.otherAcksLength = function () {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    };
    ClientSend.prototype.otherAcksArray = function () {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
    };
    ClientSend.startClientSend = function (builder) {
        builder.startObject(3);
    };
    ClientSend.addMyIndex = function (builder, myIndex) {
        builder.addFieldInt32(0, myIndex, 0);
    };
    ClientSend.addMyFrames = function (builder, myFramesOffset) {
        builder.addFieldOffset(1, myFramesOffset, 0);
    };
    ClientSend.addOtherAcks = function (builder, otherAcksOffset) {
        builder.addFieldOffset(2, otherAcksOffset, 0);
    };
    ClientSend.createOtherAcksVector = function (builder, data) {
        builder.startVector(4, data.length, 4);
        for (var i = data.length - 1; i >= 0; i--) {
            builder.addInt32(data[i]);
        }
        return builder.endVector();
    };
    ClientSend.startOtherAcksVector = function (builder, numElems) {
        builder.startVector(4, numElems, 4);
    };
    ClientSend.endClientSend = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    ClientSend.prototype.unpack = function () {
        return new ClientSendT(this.myIndex(), (this.myFrames() !== null ? this.myFrames().unpack() : null), this.bb.createScalarList(this.otherAcks.bind(this), this.otherAcksLength()));
    };
    ClientSend.prototype.unpackTo = function (_o) {
        _o.myIndex = this.myIndex();
        _o.myFrames = (this.myFrames() !== null ? this.myFrames().unpack() : null);
        _o.otherAcks = this.bb.createScalarList(this.otherAcks.bind(this), this.otherAcksLength());
    };
    return ClientSend;
}());
exports.ClientSend = ClientSend;
var ClientSendT = (function () {
    function ClientSendT(myIndex, myFrames, otherAcks) {
        if (myIndex === void 0) { myIndex = 0; }
        if (myFrames === void 0) { myFrames = null; }
        if (otherAcks === void 0) { otherAcks = []; }
        this.myIndex = myIndex;
        this.myFrames = myFrames;
        this.otherAcks = otherAcks;
    }
    ClientSendT.prototype.pack = function (builder) {
        var myFrames = (this.myFrames !== null ? this.myFrames.pack(builder) : 0);
        var otherAcks = ClientSend.createOtherAcksVector(builder, this.otherAcks);
        ClientSend.startClientSend(builder);
        ClientSend.addMyIndex(builder, this.myIndex);
        ClientSend.addMyFrames(builder, myFrames);
        ClientSend.addOtherAcks(builder, otherAcks);
        return ClientSend.endClientSend(builder);
    };
    return ClientSendT;
}());
exports.ClientSendT = ClientSendT;
//# sourceMappingURL=client-send.js.map