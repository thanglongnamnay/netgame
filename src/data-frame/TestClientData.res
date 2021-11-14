let sendData: ClientRoom.sendData = {
  myIndex: 1,
  myFrames: {
    end: 3,
    payloads: [Payload.nope, Payload.nope]->ImmuArray.make,
  },
  otherAcks: [3, 0],
}
Tests.run(
  __POS_OF__("serialize and deserialize sendData should be the same as do nothing"),
  sendData->ClientRoom.serializeSend->ClientRoom.deserializeSend,
  Tests.equal,
  sendData,
)
let receiveData: ClientRoom.receiveData = {
  serverAck: 20, // dont send anything older than this
  players: Belt.Array.make(5, Frames.nope()),
}
Tests.run(
  __POS_OF__("serialize and deserialize receiveData should be the same as do nothing"),
  receiveData->ClientRoom.serializeReceive->ClientRoom.deserializeReceive,
  Tests.equal,
  receiveData,
)

Tests.run(
  __POS_OF__("pack and read sendData should be the same as do nothing"),
  sendData->ClientRoom.packSend->ClientRoom.readSend,
  Tests.equal,
  sendData,
)

Tests.run(
  __POS_OF__("pack and read receiveData should be the same as do nothing"),
  receiveData->ClientRoom.packReceive->ClientRoom.readReceive,
  Tests.equal,
  receiveData,
)
