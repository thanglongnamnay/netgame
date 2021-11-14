type t = {
  myIndex: int,
  playersFrames: array<Frames.t>, // ack = frames.length
  serverAck: int, // we send frames newer than this to server
}
type sendData = {
  myIndex: int,
  myFrames: Frames.t,
  otherAcks: array<int>,
}
let serializeSend = t => Rebuffers.Schema([
  Int(t.myIndex),
  Frames.serialize(t.myFrames),
  Array(Rebuffers.toList(t.otherAcks, ack => Int(ack))),
])
let sendSchema = () =>
  serializeSend({
    myIndex: 0,
    myFrames: {
      end: 0,
      payloads: []->ImmuArray.make,
    },
    otherAcks: [0],
  })
let deserializeSend = (schema: Rebuffers.schema) =>
  switch schema {
  | Schema([Int(myIndex), myFrames, otherAcks]) => {
      myIndex: myIndex,
      myFrames: Frames.deserialize(myFrames),
      otherAcks: Rebuffers.deserialize(otherAcks, Array(Int)),
    }
  | _ => raise(Not_found)
  }
type receiveData = {
  serverAck: int, // dont send anything older than this
  players: array<Frames.t>,
}
let serializeReceive = t => Rebuffers.Schema([
  Int(t.serverAck),
  Array(Rebuffers.toList(t.players, Frames.serialize)),
])
let receiveSchema = serializeReceive({
  serverAck: 0, // dont send anything older than this
  players: [],
})
let deserializeReceive = (schema: Rebuffers.schema) =>
  switch schema {
  | Schema([Int(serverAck), players]) => {
      serverAck: serverAck,
      players: Rebuffers.deserialize(players, List(Frames.deserialize)),
    }
  | _ => raise(Not_found)
  }
@deriving(accessors)
type action =
  | Receive(receiveData)
  | Consume
  | AddFrame(Payload.t)

let nope = (myIndex, playerCount) => {
  myIndex: myIndex,
  playersFrames: Belt.Array.make(playerCount, Frames.nope()),
  serverAck: -1,
}

let getFirstFrames = t =>
  t.playersFrames->Belt.Array.map(frames => frames->Frames.getFirstFrame->Belt.Option.getExn)

let getSendData = (t: t) => {
  myIndex: t.myIndex,
  myFrames: t.playersFrames->Belt.Array.getExn(t.myIndex),
  otherAcks: t.playersFrames->Belt.Array.map(frames => frames.end),
}

let step = (t: t, action) =>
  switch action {
  | Consume => {
      ...t,
      playersFrames: t.playersFrames->Belt.Array.map(Frames.step(_, Shift)),
    }
  | Receive(data) => {
      ...t,
      serverAck: data.serverAck,
      playersFrames: t.playersFrames
      ->Belt.Array.zip(data.players)
      ->Belt.Array.map(((f1, f2)) => f1->Frames.step(Concat(f2))),
    }
  | AddFrame(payload) => {
      ...t,
      playersFrames: t.playersFrames->Array.set(t.myIndex, Frames.step(_, AddPayload(payload))),
    }
  }
