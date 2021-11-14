type action = Shoot(Vec2.t) | Jump(Vec2.t)
type t = {
  lastShoot: int,
  lastJump: int,
  dtShoot: int,
  dtJump: int,
  queue: array<action>,
}

let make = (~dtShoot, ~dtJump) => {
  lastShoot: 0,
  lastJump: 0,
  dtShoot: dtShoot,
  dtJump: dtJump,
  queue: [],
}

let step = (t, action, tick) =>
  switch action {
  | Shoot(_) as a =>
    if tick - t.lastShoot >= t.dtShoot {
      {
        ...t,
        lastShoot: tick,
        queue: t.queue->Belt.Array.concat([a]),
      }
    } else {
      t
    }
  | Jump(_) as a =>
    if tick - t.lastJump >= t.dtJump {
      {
        ...t,
        lastJump: tick,
        queue: t.queue->Belt.Array.concat([a]),
      }
    } else {
      t
    }
  }

let clear = t => {
  ...t,
  queue: [],
}
let getShoot = t =>
  Belt.Array.keepMap(t.queue, action =>
    switch action {
    | Shoot(d) => Some(d)
    | Jump(_) => None
    }
  )
let getJump = t =>
  Belt.Array.keepMap(t.queue, action =>
    switch action {
    | Shoot(_) => None
    | Jump(d) => Some(d)
    }
  )
