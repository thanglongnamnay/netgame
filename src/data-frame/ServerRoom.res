type player = {
  acks: array<int>,
  frames: Frames.t,
}
type t = {
  id: int,
  players: array<player>,
}
type sendData = ClientRoom.receiveData
type receiveData = ClientRoom.sendData
@deriving(accessors)
type action = Receive(receiveData) | Consume
let nope = playerCount => {
  id: 0,
  players: Belt.Array.make(
    playerCount,
    {
      acks: [],
      frames: Frames.nope(),
    },
  ),
}
let getSendData = t =>
  t.players->Belt.Array.map((player): sendData => {
    serverAck: player.frames.end,
    players: t.players->Belt.Array.mapWithIndex((i, p) =>
      p != player
        ? p.frames->Frames.step(RemoveFrom(player.acks->Belt.Array.getExn(i)))
        : Frames.nope()
    ),
  })

let getSendDataRaw = t => t->getSendData->Belt.Array.map(ClientRoom.packReceive)

let step = (t, action) =>
  switch action {
  | Receive(data) => {
      ...t,
      players: t.players->Array.set(data.myIndex, player => {
        acks: data.otherAcks,
        frames: player.frames->Frames.step(Concat(data.myFrames)),
      }),
    }
  | Consume => {
      ...t,
      players: t.players->Belt.Array.map(player => {
        ...player,
        frames: player.frames->Frames.step(Shift),
      }),
    }
  }

let getFramesAt = (t, index) => t.players->Belt.Array.map(p => p.frames->Frames.getFrameAt(index))
