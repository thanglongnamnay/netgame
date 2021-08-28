class ResizeableBuffer {
  constructor(hint = 4) {
    this.buffer = Buffer.alloc(hint);
    this.offset = 0;
  }
  noOverflow(size) {
    if (this.buffer.length > this.offset + size) {
      this.resize();
    }
  }
  resize(factor = 1.5) {
    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(this.buffer.length * (factor - 1) | 0)]);
  }
  pack() {
    this.buffer = Buffer.concat([this.buffer], this.offset);
    return this.buffer;
  }
  putByte(v) {
    this.noOverflow(1);
    this.buffer.writeInt8(v, this.offset);
    this.offset += 1;
  }
  putShort(v) {
    this.noOverflow(2);
    this.buffer.writeInt16BE(v, this.offset);
    this.offset += 2;
  }
  putInt(v) {
    this.noOverflow(4);
    this.buffer.writeInt32BE(v, this.offset);
    this.offset += 4;
  }
  putString(v) {
    const str = unescape(encodeURIComponent(v));
    this.putShort(str.length);
    for (var i = 0; i < str.length; i++) {
      this.putByte(str.charCodeAt(i));
    }
  }
}

module.exports = exports = ResizeableBuffer;