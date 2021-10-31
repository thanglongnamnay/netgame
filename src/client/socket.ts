import * as flatbuffers from 'flatbuffers'
import * as dgram from 'dgram'
import { ServerSend, ServerSendT } from '../flat-models/server-send'
import { ClientSendT } from '../flat-models/client-send'
const constants = require("../constants");

const create = (cb: (receiveObj: ServerSendT) => void) => {
  const client = dgram.createSocket('udp4');

  client.on('error', (err) => {
    console.log(`client error:\n${err.stack}`);
    client.close();
    client.send = () => { }
  });

  client.on('message', (msg, rinfo) => {
    const receiveObj = ServerSend.getRootAsServerSend(new flatbuffers.ByteBuffer(msg)).unpack();

    // console.log(`client got from ${rinfo.address}:${rinfo.port}`, JSON.stringify(receiveObj));
    cb(receiveObj);
  });

  client.connect(41234, constants.host);
  return client;
}
const fbb = new flatbuffers.Builder(1);
const send = (client: dgram.Socket, index: number, sendObj: ClientSendT) => {
  fbb.clear();
  fbb.finish(sendObj.pack(fbb))
  const id = Buffer.allocUnsafe(4);
  id.writeInt32LE(index, 0);
  client.send(Buffer.concat([id, fbb.asUint8Array()]));
}
export {
  create,
  send,
}