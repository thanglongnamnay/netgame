// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Frames, FramesT } from './frames';


export class ServerSend {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):ServerSend {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsServerSend(bb:flatbuffers.ByteBuffer, obj?:ServerSend):ServerSend {
  return (obj || new ServerSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsServerSend(bb:flatbuffers.ByteBuffer, obj?:ServerSend):ServerSend {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new ServerSend()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

serverAck():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

players(index: number, obj?:Frames):Frames|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? (obj || new Frames()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null;
}

playersLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

custom():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : -69;
}

static startServerSend(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addServerAck(builder:flatbuffers.Builder, serverAck:number) {
  builder.addFieldInt32(0, serverAck, 0);
}

static addPlayers(builder:flatbuffers.Builder, playersOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, playersOffset, 0);
}

static createPlayersVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startPlayersVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addCustom(builder:flatbuffers.Builder, custom:number) {
  builder.addFieldInt32(2, custom, -69);
}

static endServerSend(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createServerSend(builder:flatbuffers.Builder, serverAck:number, playersOffset:flatbuffers.Offset, custom:number):flatbuffers.Offset {
  ServerSend.startServerSend(builder);
  ServerSend.addServerAck(builder, serverAck);
  ServerSend.addPlayers(builder, playersOffset);
  ServerSend.addCustom(builder, custom);
  return ServerSend.endServerSend(builder);
}

unpack(): ServerSendT {
  return new ServerSendT(
    this.serverAck(),
    this.bb!.createObjList(this.players.bind(this), this.playersLength()),
    this.custom()
  );
}


unpackTo(_o: ServerSendT): void {
  _o.serverAck = this.serverAck();
  _o.players = this.bb!.createObjList(this.players.bind(this), this.playersLength());
  _o.custom = this.custom();
}
}

export class ServerSendT {
constructor(
  public serverAck: number = 0,
  public players: (FramesT)[] = [],
  public custom: number = -69
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const players = ServerSend.createPlayersVector(builder, builder.createObjectOffsetList(this.players));

  return ServerSend.createServerSend(builder,
    this.serverAck,
    players,
    this.custom
  );
}
}