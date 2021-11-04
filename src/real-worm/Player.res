type id = int
type hp = int
type t = {
  id: id,
  hp: hp,
}
@deriving(accessors)
type action = MapHp(int => int)
let make = (~id, ~hp) => {
  id: id,
  hp: hp,
}
let step = (t, action) =>
  switch action {
  | MapHp(f) => {
      ...t,
      hp: f(t.hp),
    }
  }

let isAlive = t => t.hp > 0
