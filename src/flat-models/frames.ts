// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Payload, PayloadT } from './payload';


export class Frames {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):Frames {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsFrames(bb:flatbuffers.ByteBuffer, obj?:Frames):Frames {
  return (obj || new Frames()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsFrames(bb:flatbuffers.ByteBuffer, obj?:Frames):Frames {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Frames()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

end():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

payloads(index: number, obj?:Payload):Payload|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? (obj || new Payload()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null;
}

payloadsLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

static startFrames(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addEnd(builder:flatbuffers.Builder, end:number) {
  builder.addFieldInt32(0, end, 0);
}

static addPayloads(builder:flatbuffers.Builder, payloadsOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, payloadsOffset, 0);
}

static createPayloadsVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startPayloadsVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static endFrames(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createFrames(builder:flatbuffers.Builder, end:number, payloadsOffset:flatbuffers.Offset):flatbuffers.Offset {
  Frames.startFrames(builder);
  Frames.addEnd(builder, end);
  Frames.addPayloads(builder, payloadsOffset);
  return Frames.endFrames(builder);
}

unpack(): FramesT {
  return new FramesT(
    this.end(),
    this.bb!.createObjList(this.payloads.bind(this), this.payloadsLength())
  );
}


unpackTo(_o: FramesT): void {
  _o.end = this.end();
  _o.payloads = this.bb!.createObjList(this.payloads.bind(this), this.payloadsLength());
}
}

export class FramesT {
constructor(
  public end: number = 0,
  public payloads: (PayloadT)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const payloads = Frames.createPayloadsVector(builder, builder.createObjectOffsetList(this.payloads));

  return Frames.createFrames(builder,
    this.end,
    payloads
  );
}
}
