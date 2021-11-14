import * as flatbuffers from 'flatbuffers'
import * as dgram from 'dgram'
const constants = require("../constants");

const create = (cb: (receiveObj: Buffer) => void) => {
  const client = dgram.createSocket('udp4');

  client.on('error', (err) => {
    console.log(`client error:\n${err.stack}`);
    client.close();
    client.send = () => { }
  });

  client.on('message', (msg, rinfo) => {
    cb(msg);
  });

  client.connect(8081, constants.host);
  return client;
}
const fbb = new flatbuffers.Builder(1);
const sendRaw = (client: dgram.Socket, index: number, data: Buffer) => {
  const id = Buffer.allocUnsafe(4);
  id.writeInt32LE(index, 0);
  client.send(Buffer.concat([id, data]));
}
export {
  create,
  sendRaw,
}