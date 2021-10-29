type world = {nodes: array<Node.t>}
let carNode = (_): Node.t => {
  skills: {
    transform: {
      position: Position({
        x: Random.float(300.),
        y: Random.float(300.),
      }),
      scale: Scale({
        x: 1.,
        y: 1.,
      }),
      rotation: Rotation(0.),
    }->Some,
    movable: {
      velocity: Velocity({
        x: 0.,
        y: 0.,
      }),
      acceleration: Acceleration({
        x: 0.,
        y: 0.,
      }),
      maxSpeed: MaxSpeed(200.),
    }->Some,
    carLike: {
      direction: Direction(Vec2.create(0., -1.)),
      gas: No,
      steer: No,
      turnRate: TurnRate(-4.),
      stats: {
        speed: 30.,
        acceleration: 20.,
        handle: 60.,
      },
    }->Some,
    sprite: {
      src: "resource/police-car-siren-blue.png",
    }->Some,
  },
  zOrder: 0,
  children: [],
}
let createWorld = (playerCount): world => {
  nodes: Belt.Array.makeBy(playerCount, carNode),
}
let step = (world, inputs, dt) => {
  nodes: world.nodes->Belt.Array.mapWithIndex((index, node) =>
    node->Node.step(inputs->Belt.Array.getExn(index), dt)
  ),
}
@val external now: unit => int = "Date.now"
Random.init(now())
