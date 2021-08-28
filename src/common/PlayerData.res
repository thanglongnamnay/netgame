type t = {
  id: int,
  clientAck: int,
  frames: Frames.t,
}
type action =
  | Ack(int)
  | Frames(Frames.action)

let step = (t, action) =>
  switch action {
  | Ack(ack) => {
      ...t,
      clientAck: ack,
    }
  | Frames(action) => {
      ...t,
      frames: t.frames->Frames.step(action),
    }
  }
