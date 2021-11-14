type player = {
  acks: array<int>,
  frames: Frames.t,
}
type t = {
  id: int,
  players: array<player>,
}
type sendData = ClientData.receiveData
type receiveData = ClientData.sendData
@deriving(accessors)
type action = Receive(receiveData)
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

let step = (t, action) =>
  switch action {
  | Receive(data) => {
      ...t,
      players: t.players->Array.set(data.myIndex, player => {
        acks: data.otherAcks,
        frames: player.frames->Frames.step(Concat(data.myFrames)),
      }),
    }
  }
