type t = {
  end: int,
  payloads: ImmuArray.t<Payload.t>,
}
type action =
  | Concat(t)
  | RemoveFrom(int)

let step = (t, action) =>
  switch action {
  | Concat(other) => t
  | RemoveFrom(index) => t
  }
