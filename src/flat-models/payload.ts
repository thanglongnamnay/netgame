// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Pos, PosT } from './pos';


export class Payload {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):Payload {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsPayload(bb:flatbuffers.ByteBuffer, obj?:Payload):Payload {
  return (obj || new Payload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsPayload(bb:flatbuffers.ByteBuffer, obj?:Payload):Payload {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Payload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

keys(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt8(this.bb!.__vector(this.bb_pos + offset) + index) : 0;
}

keysLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

keysArray():Int8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? new Int8Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

touches():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : 0;
}

touchPos(obj?:Pos):Pos|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? (obj || new Pos()).__init(this.bb_pos + offset, this.bb!) : null;
}

static startPayload(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addKeys(builder:flatbuffers.Builder, keysOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, keysOffset, 0);
}

static createKeysVector(builder:flatbuffers.Builder, data:number[]|Int8Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createKeysVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createKeysVector(builder:flatbuffers.Builder, data:number[]|Int8Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(1, data.length, 1);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt8(data[i]!);
  }
  return builder.endVector();
}

static startKeysVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(1, numElems, 1);
}

static addTouches(builder:flatbuffers.Builder, touches:number) {
  builder.addFieldInt8(1, touches, 0);
}

static addTouchPos(builder:flatbuffers.Builder, touchPosOffset:flatbuffers.Offset) {
  builder.addFieldStruct(2, touchPosOffset, 0);
}

static endPayload(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}


unpack(): PayloadT {
  return new PayloadT(
    this.bb!.createScalarList(this.keys.bind(this), this.keysLength()),
    this.touches(),
    (this.touchPos() !== null ? this.touchPos()!.unpack() : null)
  );
}


unpackTo(_o: PayloadT): void {
  _o.keys = this.bb!.createScalarList(this.keys.bind(this), this.keysLength());
  _o.touches = this.touches();
  _o.touchPos = (this.touchPos() !== null ? this.touchPos()!.unpack() : null);
}
}

export class PayloadT {
constructor(
  public keys: (number)[] = [],
  public touches: number = 0,
  public touchPos: PosT|null = null
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const keys = Payload.createKeysVector(builder, this.keys);

  Payload.startPayload(builder);
  Payload.addKeys(builder, keys);
  Payload.addTouches(builder, this.touches);
  Payload.addTouchPos(builder, (this.touchPos !== null ? this.touchPos!.pack(builder) : 0));

  return Payload.endPayload(builder);
}
}
