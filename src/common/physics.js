const Merlin1d = require('./Merlin1d');
const ClipperLib = require('./clipper.js');
const Matter = require('matter-js');
const { Engine, Common, Composite, Bodies, Body, Render } = Matter;

const v2 = Matter.Vector.create
const V2 = p => ({ X: p.x, Y: p.y });
const rv2 = p => v2(p.X, p.Y);
const circle = (x, y, radius) => Matter.Bodies.polygon(x, y, 8, radius)
const createMap = (seed) => {
  const paths = Merlin1d.createMerlin(seed, 20).map((height, x) => ({
    X: x * 40,
    Y: height * 400
  }))
  const pathBorder = [
    V2(v2(-500, 400)),
    ...paths,
    V2(v2(1300, 400)),
  ];
  const subjectPaths = [pathBorder];
  const clipper = new ClipperLib.Clipper();
  clipper.AddPaths(subjectPaths, ClipperLib.PolyType.ptSubject, true);
  const subjectFillType = ClipperLib.PolyFillType.pftNonZero;
  const clipFillType = ClipperLib.PolyFillType.pftNonZero;
  const clip = (x, y, radius) => {
    var clipPaths = [circle(x, y, radius).vertices.map(V2)];
    clipper.AddPaths(clipPaths, ClipperLib.PolyType.ptClip, true);
  }
  let solutionPaths = new ClipperLib.Paths();
  const execute = () => {
    clipper.Execute(ClipperLib.ClipType.ctDifference, solutionPaths, subjectFillType, clipFillType);
  }
  execute();
  return {
    clip,
    execute,
    getPath() {
      return solutionPaths.map(path => path.map(rv2));
    }
  };
}

const Physics = (seed, dt) => {
  const map = createMap(seed);
  const engine = Engine.create();
  const world = engine.world;
  Common.setDecomp(require('poly-decomp'));

  // const render = Render.create({
  //   element: document.body,
  //   engine: engine,
  //   options: {
  //     wireframes: 1,
  //     width: 800,
  //     height: 600,
  //   }
  // });
  // Render.run(render);

  const bodies = {
    players: [],
    bullets: [],
    terrain: Bodies.fromVertices(0, 400, map.getPath(), {
      isStatic: true,
    }, true),
  }

  const addPlayer = (id, p) => {
    console.log("Physic.addPlayer", id, p);
    const body = Bodies.rectangle(p.x, p.y, 20, 20);
    body.label = "player";
    Body.setInertia(body, 200);
    body.playerId = id;
    Composite.add(world, body);
    bodies.players.push(body);
    return body;
  }
  const removePlayer = id => {
    Composite.remove(world, bodies.players.find(p => p.playerId === id));
    bodies.players = bodies.players.filter(p => p.playerId !== id);
  }
  const addBullet = (id, p, v) => {
    const body = Bodies.circle(p.x, p.y, 3, {
      isSensor: true,
    });
    body.label = "bullet";
    Body.setVelocity(body, v);
    body.bulletId = id;
    Composite.add(world, body);
    bodies.bullets.push(body);
    return body;
  }
  const removeBullet = id => {
    const bullet = bodies.bullets.find(b => b.bulletId === id);
    Composite.remove(world, bullet);
    bodies.bullets = bodies.bullets.filter(b => b.bulletId !== id);
    Matter.Events.trigger(physic, 'hit-bullet', { bid: id });
  }
  const shoot = (bulletId, playerId, lookAt) => {
    console.log("Physic.shoot", bulletId, playerId, lookAt);
    const { add, sub, mult, normalise } = Matter.Vector;
    const player = bodies.players.find(p => p.playerId === playerId);
    if (!player) return console.warn("Player dead", playerId);
    const playerPos = player.position;
    const velocity = mult(sub(lookAt, playerPos), 1 / 10);
    const shootPos = add(playerPos, mult(normalise(velocity), 10));
    return addBullet(bulletId, shootPos, velocity);
  }
  const jump = (playerId, direction) => {
    const player = bodies.players.find(p => p.playerId === playerId);
    if (!player) return console.warn("Player dead", playerId);
    console.log("Physic.jump", direction);
    Body.setVelocity(player, direction);
  }

  const refreshTerrain = () => {
    console.log("Physic.refreshTerrain");
    Composite.remove(world, bodies.terrain);
    const terrain = Bodies.fromVertices(0, 0, map.getPath(), { isStatic: true }, true);
    terrain.label = "ground";
    Matter.Body.setPosition(terrain, v2(-500 - terrain.bounds.min.x, 400 - terrain.bounds.max.y))
    Composite.add(world, terrain);
    bodies.terrain = terrain;

    Matter.Events.trigger(physic, 'refrest-terrain', map);
  }

  const clipUpdate = (positions, radius) => {
    positions.forEach(pos => {
      map.clip(pos.x, pos.y, radius);
    })
    map.execute();
    refreshTerrain();
  }

  const toClipPos = p => ({
    x: p.x - bodies.terrain.bounds.min.x - 500,
    y: p.y - bodies.terrain.bounds.max.y + 400,
  });
  // const hitPlayer = pid => {
  //   if (Game.Helper.findPlayer(logic.getGame(), pid).hp <= 0) {
  //     console.log("player die");
  //     Composite.remove(world, bodies.players.find(p => p.playerId === id));
  //   }
  // }
  const hitPlayer = (bullet, player) => {
    const distance = Matter.Vector.sub(player.position, bullet.position);
    const force = {
      x: 30 / distance.x,
      y: 30 / distance.y,
    };
    Body.setVelocity(player, force);
    Matter.Events.trigger(physic, 'hit-player', {
      bid: bullet.bulletId,
      pid: player.playerId,
    })
  }
  Matter.Events.on(engine, "collisionStart", e => {
    const { pairs } = e;
    const bullets = new Set(pairs.map(pair => {
      const { bodyA, bodyB } = pair;
      if (bodyA.label === "bullet") return bodyA;
      if (bodyB.label === "bullet") return bodyB;
    }).filter(x => x));
    bullets.forEach(bullet => {
      const pos = bullet.position;
      const hitbox = circle(pos.x, pos.y, 20);
      Matter.Query.collides(hitbox, bodies.players)
        .filter(query => query.collided)
        .forEach(query => {
          const { bodyA, bodyB } = query;
          console.log("collides", bodyA, bodyB, query);
          if (bodyA.label === "player") return hitPlayer(bullet, bodyA);
          if (bodyB.label === "player") return hitPlayer(bullet, bodyB);
        });
      removeBullet(bullet.bulletId);
    });
    if (bullets.size) {
      clipUpdate(Array.from(bullets).map(b => b.position).map(toClipPos), 20);
    }
  });

  const step = () => {
    Engine.update(engine, dt);
  }

  const physic = {
    getMap: () => map,
    getBodies: () => bodies,
    addPlayer,
    removePlayer,
    shoot,
    jump,
    step,
    refreshTerrain,
  };
  return physic;
}

module.exports.Physics = Physics;