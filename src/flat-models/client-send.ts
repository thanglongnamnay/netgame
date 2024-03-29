// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Frames, FramesT } from './frames';


export class ClientSend {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):ClientSend {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsClientSend(bb:flatbuffers.ByteBuffer, obj?:ClientSend):ClientSend {
  return (obj || new ClientSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsClientSend(bb:flatbuffers.ByteBuffer, obj?:ClientSend):ClientSend {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new ClientSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

myIndex():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

myFrames(obj?:Frames):Frames|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? (obj || new Frames()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null;
}

otherAcks(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
}

otherAcksLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

otherAcksArray():Int32Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? new Int32Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

static startClientSend(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addMyIndex(builder:flatbuffers.Builder, myIndex:number) {
  builder.addFieldInt32(0, myIndex, 0);
}

static addMyFrames(builder:flatbuffers.Builder, myFramesOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, myFramesOffset, 0);
}

static addOtherAcks(builder:flatbuffers.Builder, otherAcksOffset:flatbuffers.Offset) {
  builder.addFieldOffset(2, otherAcksOffset, 0);
}

static createOtherAcksVector(builder:flatbuffers.Builder, data:number[]|Int32Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createOtherAcksVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createOtherAcksVector(builder:flatbuffers.Builder, data:number[]|Int32Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt32(data[i]!);
  }
  return builder.endVector();
}

static startOtherAcksVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static endClientSend(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}


unpack(): ClientSendT {
  return new ClientSendT(
    this.myIndex(),
    (this.myFrames() !== null ? this.myFrames()!.unpack() : null),
    this.bb!.createScalarList(this.otherAcks.bind(this), this.otherAcksLength())
  );
}


unpackTo(_o: ClientSendT): void {
  _o.myIndex = this.myIndex();
  _o.myFrames = (this.myFrames() !== null ? this.myFrames()!.unpack() : null);
  _o.otherAcks = this.bb!.createScalarList(this.otherAcks.bind(this), this.otherAcksLength());
}
}

export class ClientSendT {
constructor(
  public myIndex: number = 0,
  public myFrames: FramesT|null = null,
  public otherAcks: (number)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const myFrames = (this.myFrames !== null ? this.myFrames!.pack(builder) : 0);
  const otherAcks = ClientSend.createOtherAcksVector(builder, this.otherAcks);

  ClientSend.startClientSend(builder);
  ClientSend.addMyIndex(builder, this.myIndex);
  ClientSend.addMyFrames(builder, myFrames);
  ClientSend.addOtherAcks(builder, otherAcks);

  return ClientSend.endClientSend(builder);
}
}
