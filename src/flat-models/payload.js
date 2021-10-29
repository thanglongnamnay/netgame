"use strict";
exports.__esModule = true;
exports.PayloadT = exports.Payload = void 0;
var flatbuffers = require("flatbuffers");
var pos_1 = require("./pos");
var Payload = (function () {
    function Payload() {
        this.bb = null;
        this.bb_pos = 0;
    }
    Payload.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    Payload.getRootAsPayload = function (bb, obj) {
        return (obj || new Payload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    Payload.getSizePrefixedRootAsPayload = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Payload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    Payload.prototype.keys = function (index) {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb.__vector(this.bb_pos + offset) + index) : 0;
    };
    Payload.prototype.keysLength = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    };
    Payload.prototype.keysArray = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? new Int8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
    };
    Payload.prototype.touches = function () {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    };
    Payload.prototype.touchPos = function (obj) {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new pos_1.Pos()).__init(this.bb_pos + offset, this.bb) : null;
    };
    Payload.startPayload = function (builder) {
        builder.startObject(3);
    };
    Payload.addKeys = function (builder, keysOffset) {
        builder.addFieldOffset(0, keysOffset, 0);
    };
    Payload.createKeysVector = function (builder, data) {
        builder.startVector(1, data.length, 1);
        for (var i = data.length - 1; i >= 0; i--) {
            builder.addInt8(data[i]);
        }
        return builder.endVector();
    };
    Payload.startKeysVector = function (builder, numElems) {
        builder.startVector(1, numElems, 1);
    };
    Payload.addTouches = function (builder, touches) {
        builder.addFieldInt8(1, touches, 0);
    };
    Payload.addTouchPos = function (builder, touchPosOffset) {
        builder.addFieldStruct(2, touchPosOffset, 0);
    };
    Payload.endPayload = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    Payload.prototype.unpack = function () {
        return new PayloadT(this.bb.createScalarList(this.keys.bind(this), this.keysLength()), this.touches(), (this.touchPos() !== null ? this.touchPos().unpack() : null));
    };
    Payload.prototype.unpackTo = function (_o) {
        _o.keys = this.bb.createScalarList(this.keys.bind(this), this.keysLength());
        _o.touches = this.touches();
        _o.touchPos = (this.touchPos() !== null ? this.touchPos().unpack() : null);
    };
    return Payload;
}());
exports.Payload = Payload;
var PayloadT = (function () {
    function PayloadT(keys, touches, touchPos) {
        if (keys === void 0) { keys = []; }
        if (touches === void 0) { touches = 0; }
        if (touchPos === void 0) { touchPos = null; }
        this.keys = keys;
        this.touches = touches;
        this.touchPos = touchPos;
    }
    PayloadT.prototype.pack = function (builder) {
        var keys = Payload.createKeysVector(builder, this.keys);
        Payload.startPayload(builder);
        Payload.addKeys(builder, keys);
        Payload.addTouches(builder, this.touches);
        Payload.addTouchPos(builder, (this.touchPos !== null ? this.touchPos.pack(builder) : 0));
        return Payload.endPayload(builder);
    };
    return PayloadT;
}());
exports.PayloadT = PayloadT;
//# sourceMappingURL=payload.js.map