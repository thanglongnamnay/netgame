let sendData: ClientData.sendData = {
  myIndex: 1,
  myFrames: {
    end: 3,
    payloads: [Payload.nope, Payload.nope]->ImmuArray.make,
  },
  otherAcks: [3, 0],
}
Tests.run(
  __POS_OF__("serialize and deserialize sendData should be the same as do nothing"),
  sendData->ClientData.serializeSend->ClientData.deserializeSend,
  Tests.equal,
  sendData,
)
let receiveData: ClientData.receiveData = {
  serverAck: 20, // dont send anything older than this
  players: Belt.Array.make(5, Frames.nope()),
}
Tests.run(
  __POS_OF__("serialize and deserialize receiveData should be the same as do nothing"),
  receiveData->ClientData.serializeReceive->ClientData.deserializeReceive,
  Tests.equal,
  receiveData,
)
