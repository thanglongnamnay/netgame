type t = {
  end: int,
  payloads: ImmuArray.t<Payload.t>,
}
type action =
  | Concat(t)
  | RemoveFrom(int)
  | AddPayload(Payload.t)
  | Shift
let nope = () => {
  end: 0,
  payloads: ImmuArray.make([]),
}
let create = (end, frames) => {end: end, payloads: frames}
let getFirstFrame = t => t.payloads->ImmuArray.head
let step = (t, action) =>
  switch action {
  | Concat(other) => {
      end: max(t.end, other.end),
      // payloads: t.payloads->ImmuArray.concat((other->getLastFrames(other.end - t.end)).payloads),
      payloads: other.end > t.end
        ? t.payloads->ImmuArray.concat(other.payloads->ImmuArray.sliceFrom(t.end - other.end))
        : t.payloads,
    }
  | RemoveFrom(ack) => {
      end: t.end,
      payloads: t.payloads->ImmuArray.sliceFrom(ack - t.end),
    }
  | AddPayload(payload) => {
      end: t.end + 1,
      payloads: t.payloads->ImmuArray.concat(ImmuArray.make([payload])),
    }
  | Shift => {
      end: t.end,
      payloads: t.payloads->ImmuArray.tail,
    }
  }
