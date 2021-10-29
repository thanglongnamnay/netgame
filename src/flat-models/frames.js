"use strict";
exports.__esModule = true;
exports.FramesT = exports.Frames = void 0;
var flatbuffers = require("flatbuffers");
var payload_1 = require("./payload");
var Frames = (function () {
    function Frames() {
        this.bb = null;
        this.bb_pos = 0;
    }
    Frames.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    Frames.getRootAsFrames = function (bb, obj) {
        return (obj || new Frames()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    Frames.getSizePrefixedRootAsFrames = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Frames()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    Frames.prototype.end = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    Frames.prototype.payloads = function (index, obj) {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new payload_1.Payload()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    };
    Frames.prototype.payloadsLength = function () {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    };
    Frames.startFrames = function (builder) {
        builder.startObject(2);
    };
    Frames.addEnd = function (builder, end) {
        builder.addFieldInt32(0, end, 0);
    };
    Frames.addPayloads = function (builder, payloadsOffset) {
        builder.addFieldOffset(1, payloadsOffset, 0);
    };
    Frames.createPayloadsVector = function (builder, data) {
        builder.startVector(4, data.length, 4);
        for (var i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    };
    Frames.startPayloadsVector = function (builder, numElems) {
        builder.startVector(4, numElems, 4);
    };
    Frames.endFrames = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    Frames.createFrames = function (builder, end, payloadsOffset) {
        Frames.startFrames(builder);
        Frames.addEnd(builder, end);
        Frames.addPayloads(builder, payloadsOffset);
        return Frames.endFrames(builder);
    };
    Frames.prototype.unpack = function () {
        return new FramesT(this.end(), this.bb.createObjList(this.payloads.bind(this), this.payloadsLength()));
    };
    Frames.prototype.unpackTo = function (_o) {
        _o.end = this.end();
        _o.payloads = this.bb.createObjList(this.payloads.bind(this), this.payloadsLength());
    };
    return Frames;
}());
exports.Frames = Frames;
var FramesT = (function () {
    function FramesT(end, payloads) {
        if (end === void 0) { end = 0; }
        if (payloads === void 0) { payloads = []; }
        this.end = end;
        this.payloads = payloads;
    }
    FramesT.prototype.pack = function (builder) {
        var payloads = Frames.createPayloadsVector(builder, builder.createObjectOffsetList(this.payloads));
        return Frames.createFrames(builder, this.end, payloads);
    };
    return FramesT;
}());
exports.FramesT = FramesT;
//# sourceMappingURL=frames.js.map