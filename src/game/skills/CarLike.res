type steer = No | Left | Right
type gas = No | Forward | Backward | Break
@unboxed type turnRate = TurnRate(float)
@unboxed type direction = Direction(Vec2.t)
type stats = {
  speed: float,
  acceleration: float,
  handle: float,
}
type t = {
  direction: direction,
  gas: gas,
  steer: steer,
  turnRate: turnRate,
  stats: stats,
}
type action =
  | NoSteer
  | SteerLeft
  | SteerRight
  | Release
  | SpeedUp
  | Reverse
  | Break

let reduce = (t, action) =>
  switch action {
  | NoSteer => {...t, steer: No}
  | SteerLeft => {...t, steer: Left}
  | SteerRight => {...t, steer: Right}
  | Release => {...t, gas: No}
  | SpeedUp => {...t, gas: Forward}
  | Reverse => {...t, gas: Backward}
  | Break => {...t, gas: Break}
  }

let step = ((t, movable: Movable.t, transform: Transform.t), input: Input.t, dt) => {
  let t = t->reduce(Release)->reduce(NoSteer)
  let t =
    input.keys
    ->Belt.Array.keepMap(v =>
      switch v {
      | 'a' => Some(SteerLeft)
      | 'd' => Some(SteerRight)
      | 'w' => Some(SpeedUp)
      | 's' => Some(Break)
      | _ => None
      }
    )
    ->Belt.Array.reduce(t, (a, v) => a->reduce(v))
  let Transform.Rotation(rotation) = transform.rotation
  let Direction(direction) = t.direction
  let TurnRate(turnRate) = t.turnRate
  let Movable.Velocity(v) = movable.velocity
  let magV = Vec2.mag(v)
  let stats = t.stats
  // let turnRatePositive = turnRate /. abs_float(turnRate)
  let deltaRotation = turnRate *. dt *. magV /. stats.speed
  let deltaRotation =
    direction->Vec2.rotate(rotation)->Vec2.dot(v) > 0. ? deltaRotation : -.deltaRotation
  let newRotaion = switch t.steer {
  | No => rotation
  | Left => rotation +. deltaRotation
  | Right => rotation -. deltaRotation
  }
  let gasPower = stats.acceleration
  let forward = direction->Vec2.rotate(newRotaion)
  let right = forward->Vec2.rotate(-3.14 /. 2.)

  let motion = switch t.gas {
  | No => Vec2.zero
  | Forward => forward
  | Backward => forward->Vec2.mult(-1.)
  | Break => forward->Vec2.mult(-1.)
  }
  let newAcceleration = motion->Vec2.mult(gasPower)

  let lateralVelocity = right->Vec2.mult(Vec2.dot(v, right))
  let lateralFriction = lateralVelocity->Vec2.norm->Vec2.mult(-.stats.handle)
  let backwardFriction = v->Vec2.norm->Vec2.mult(-20.)
  let velocity = v->Vec2.plus(backwardFriction->Vec2.plus(lateralFriction)->Vec2.mult(dt))

  (
    t,
    {
      ...movable,
      maxSpeed: MaxSpeed(stats.speed),
      velocity: Velocity(velocity),
      acceleration: Acceleration(newAcceleration),
    },
    {
      ...transform,
      rotation: Rotation(newRotaion),
    },
  )
}
