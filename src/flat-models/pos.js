"use strict";
exports.__esModule = true;
exports.PosT = exports.Pos = void 0;
var Pos = (function () {
    function Pos() {
        this.bb = null;
        this.bb_pos = 0;
    }
    Pos.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    Pos.prototype.x = function () {
        return this.bb.readFloat32(this.bb_pos);
    };
    Pos.prototype.y = function () {
        return this.bb.readFloat32(this.bb_pos + 4);
    };
    Pos.sizeOf = function () {
        return 8;
    };
    Pos.createPos = function (builder, x, y) {
        builder.prep(4, 8);
        builder.writeFloat32(y);
        builder.writeFloat32(x);
        return builder.offset();
    };
    Pos.prototype.unpack = function () {
        return new PosT(this.x(), this.y());
    };
    Pos.prototype.unpackTo = function (_o) {
        _o.x = this.x();
        _o.y = this.y();
    };
    return Pos;
}());
exports.Pos = Pos;
var PosT = (function () {
    function PosT(x, y) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        this.x = x;
        this.y = y;
    }
    PosT.prototype.pack = function (builder) {
        return Pos.createPos(builder, this.x, this.y);
    };
    return PosT;
}());
exports.PosT = PosT;
//# sourceMappingURL=pos.js.map