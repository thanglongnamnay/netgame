"use strict";
exports.__esModule = true;
exports.PayloadT = exports.Payload = void 0;
var pos_1 = require("./pos");
var touch_1 = require("./touch");
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
    Payload.prototype.touch = function () {
        return this.bb.readInt8(this.bb_pos);
    };
    Payload.prototype.pos = function (obj) {
        return (obj || new pos_1.Pos()).__init(this.bb_pos + 2, this.bb);
    };
    Payload.sizeOf = function () {
        return 6;
    };
    Payload.createPayload = function (builder, touch, pos_x, pos_y) {
        builder.prep(2, 6);
        builder.prep(2, 4);
        builder.writeInt16(pos_y);
        builder.writeInt16(pos_x);
        builder.pad(1);
        builder.writeInt8(touch);
        return builder.offset();
    };
    Payload.prototype.unpack = function () {
        return new PayloadT(this.touch(), (this.pos() !== null ? this.pos().unpack() : null));
    };
    Payload.prototype.unpackTo = function (_o) {
        _o.touch = this.touch();
        _o.pos = (this.pos() !== null ? this.pos().unpack() : null);
    };
    return Payload;
}());
exports.Payload = Payload;
var PayloadT = (function () {
    function PayloadT(touch, pos) {
        if (touch === void 0) { touch = touch_1.Touch.Up; }
        if (pos === void 0) { pos = null; }
        this.touch = touch;
        this.pos = pos;
    }
    PayloadT.prototype.pack = function (builder) {
        return Payload.createPayload(builder, this.touch, (this.pos === null ? 0 : this.pos.x), (this.pos === null ? 0 : this.pos.y));
    };
    return PayloadT;
}());
exports.PayloadT = PayloadT;
//# sourceMappingURL=payload.js.map