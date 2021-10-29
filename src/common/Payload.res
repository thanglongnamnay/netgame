type t = Input.t
// barebone payload, like a primitive, there's no mutate action
let nope: t = {
  keys: ['a', 'b'],
  touches: 0,
  touchPos: {
    x: 0.,
    y: 0.,
  },
}
let serialize = (t: t) => Rebuffers.Schema([
  Array(Rebuffers.toList(t.keys, key => Rebuffers.Byte(key->Char.code))),
  Byte(t.touches),
  Float(t.touchPos.x),
  Float(t.touchPos.y),
])
let deserialize = (schema: Rebuffers.schema): t => {
  switch schema {
  | Schema([keys, Byte(touches), Float(x), Float(y)]) => {
      keys: keys->Rebuffers.deserialize(Array(Byte))->Belt.Array.map(Char.chr),
      touches: touches,
      touchPos: {x: x, y: y},
    }
  | _ => raise(Not_found)
  }
}
