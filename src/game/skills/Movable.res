@unboxed type velocity = Velocity(Vec2.t)
@unboxed type acceleration = Acceleration(Vec2.t)
@unboxed type maxSpeed = MaxSpeed(float)
type t = {
  velocity: velocity,
  acceleration: acceleration,
  maxSpeed: maxSpeed,
}

let step = ((t, transform: Transform.t), dt) => {
  let Velocity(v) = t.velocity
  let Acceleration(a) = t.acceleration
  let MaxSpeed(maxSpeed) = t.maxSpeed
  let velocity = v->Vec2.plus(a->Vec2.mult(dt))
  let velocity = Vec2.mag2(velocity) > 1. ? velocity : Vec2.zero
  let velocity = Vec2.mag(velocity) > maxSpeed ? velocity->Vec2.norm->Vec2.mult(maxSpeed) : velocity
  let Transform.Position(p) = transform.position
  let position = p->Vec2.plus(velocity->Vec2.mult(dt))
  (
    {
      ...t,
      velocity: Velocity(velocity),
    },
    {...transform, position: Position(position)},
  )
}
