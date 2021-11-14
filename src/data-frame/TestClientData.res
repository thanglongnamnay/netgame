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

let sendSchemad = sendData->ClientRoom.serializeSend
Js.log2("send schema", sendSchemad)

let testSchema = Rebuffers.Schema([
  Int(1),
  Bool(true),
  Array(Rebuffers.toList([1, 2, 3], i => Int(i))),
])

Tests.run(
  __POS_OF__("pack and read send should be the same as do nothing"),
  sendData
  ->ClientRoom.serializeSend
  ->Rebuffers.pack
  ->Rebuffers.read(ClientRoom.sendSchema)
  ->ClientRoom.deserializeSend,
  Tests.equal,
  sendData,
)

Tests.run(
  __POS_OF__("pack and reac receiveData should be the same as do nothing"),
  receiveData
  ->ClientRoom.serializeReceive
  ->Rebuffers.pack
  ->Rebuffers.read(ClientRoom.receiveSchema)
  ->ClientRoom.deserializeReceive,
  Tests.equal,
  receiveData,
)
