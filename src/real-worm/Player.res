type id = int
type hp = int
type t = {
  id: id,
  hp: hp,
  action: Action.t,
}
@deriving(accessors)
type action =
  | MapHp(int => int)
  | Shoot(Vec2.t, int)
  | Jump(Vec2.t, int)
  | Tick
let make = (~id, ~hp, ~action) => {
  id: id,
  hp: hp,
  action: action,
}
let step = (t, action) =>
  switch action {
  | MapHp(f) => {
      ...t,
      hp: f(t.hp),
    }
  | Shoot(d, tick) => {
      ...t,
      action: t.action->Action.step(Shoot(d), tick),
    }
  | Jump(d, tick) => {
      ...t,
      action: t.action->Action.step(Jump(d), tick),
    }
  | Tick => {
      ...t,
      action: t.action->Action.clear,
    }
  }

let isAlive = t => t.hp > 0
