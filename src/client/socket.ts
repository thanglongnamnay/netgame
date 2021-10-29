import * as flatbuffers from 'flatbuffers'
import * as dgram from 'dgram'
import { ServerSend, ServerSendT } from '../flat-models/server-send'
import { ClientSendT } from '../flat-models/client-send'
const create = (cb: (receiveObj: ServerSendT) => void) => {
  const client = dgram.createSocket('udp4');

  client.on('error', (err) => {
    console.log(`client error:\n${err.stack}`);
    client.close();
  });

  client.on('message', (msg, rinfo) => {
    const receiveObj = ServerSend.getRootAsServerSend(new flatbuffers.ByteBuffer(msg)).unpack();

    // console.log(`client got from ${rinfo.address}:${rinfo.port}`, JSON.stringify(receiveObj));
    cb(receiveObj);
  });

  client.connect(41234);
  return client;
}
const fbb = new flatbuffers.Builder(1);
const send = (client: dgram.Socket, sendObj: ClientSendT) => {
  fbb.clear();
  fbb.finish(sendObj.pack(fbb))
  client.send(fbb.asUint8Array());
}
export {
  create,
  send,
}