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
type receiveData = {
  serverAck: int, // dont send anything older than this
  players: array<Frames.t>,
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
  myFrames: t.playersFrames->Belt.Array.get(t.myIndex)->Belt.Option.getExn,
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
