module Body = {
  type t = {
    angle: float,
    position: Vec2.t,
  }
  type options
  @obj
  external makeOptions: (
    ~angle: float=?,
    ~angularSpeed: float=?,
    ~angularVelocity: float=?,
    ~area: float=?,
    ~axes: Vec2.t=?,
    ~density: float=?,
    ~force: Vec2.t=?,
    ~friction: float=?,
    ~frictionAir: float=?,
    ~id: float=?,
    ~inertia: float=?,
    ~inverseInertia: float=?,
    ~inverseMass: float=?,
    ~isSensor: bool=?,
    ~isSleeping: bool=?,
    ~isStatic: bool=?,
    ~label: string=?,
    ~mass: float=?,
    ~motion: float=?,
    ~position: Vec2.t=?,
    ~restitution: float=?,
    ~sleepThreshold: float=?,
    ~slop: float=?,
    ~speed: float=?,
    ~timeScale: float=?,
    ~torque: float=?,
    ~velocity: Vec2.t=?,
    ~vertices: Vec2.t=?,
    ~parts: array<Vec2.t>=?,
    ~frictionStatic: float=?,
    unit,
  ) => options = ""

  type methods = {setVelocity: (t, Vec2.t) => unit}
  %%private(@module("matter-js") external methods: methods = "Body")
  let {setVelocity} = methods
}

module Bodies = {
  type methods = {
    rectangle: (
      . ~x: float,
      ~y: float,
      ~width: float,
      ~height: float,
      ~options: Body.options,
    ) => Body.t,
    circle: (. ~x: float, ~y: float, ~radius: float, ~options: Body.options) => Body.t,
    fromVertices: (
      . ~x: float,
      ~y: float,
      ~paths: array<array<Vec2.t>>,
      ~options: Body.options,
      ~flagInternal: bool,
    ) => Body.t,
  }
  %%private(@module("matter-js") external methods: methods = "Bodies")
  let {rectangle, circle, fromVertices} = methods
}

module Composite = {
  type t
  type methods = {
    add: (t, array<Body.t>) => unit,
    remove: (t, array<Body.t>) => unit,
  }
  %%private(@module("matter-js") external methods: methods = "Composite")
  let {add, remove} = methods
}
