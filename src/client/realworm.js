const Matter = require('matter-js');
const Merlin1d = require('./Merlin1d');
const ClipperLib = require('./clipper.js');
const socket = require("./socket");
const ClientData = require("../data-frame/ClientData.bs");
const { ClientSendT } = require("../flat-models/client-send");
const converter = require("../converter");
const constants = require("../constants");
const PIXI = require('pixi.js');
const { Input } = require('./input');

const { Engine, Common, Composite, Bodies, Body, Render } = Matter;
const stringify = v => JSON.stringify(v, null, 2);

const clamp = (a, b, x) => x < a ? a : (x > b ? b : a);
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

    // pathToSvg(solutionPaths);
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

const playerGeometry = new PIXI.GraphicsGeometry();
const playerFill = new PIXI.FillStyle();
playerFill.color = 0xaaaa00;
playerFill.visible = true;
playerGeometry.drawShape(new PIXI.Rectangle(-10, -10, 20, 20), playerFill, new PIXI.LineStyle(), new PIXI.Matrix());

const createPlayer = (p, options = {}) => {
  let { hp } = {
    hp: 1,
    ...options,
  };
  const body = Matter.Bodies.rectangle(p.x, p.y, 20, 20);
  body.label = "player";
  Matter.Body.setInertia(body, 200);

  const obj = new PIXI.Graphics(playerGeometry);

  return {
    getHp() { return hp; },
    mapHp(f) { hp = f(hp); },
    body,
    renderer: obj,
  };
}

const bulletGeometry = new PIXI.GraphicsGeometry();
bulletGeometry.drawShape(new PIXI.Circle(0, 0, 5), playerFill, new PIXI.LineStyle(), new PIXI.Matrix());
const createBullet = (p, v, options = {}) => {
  let { damage } = {
    damage: 45,
    ...options,
  };
  const body = Matter.Bodies.circle(p.x, p.y, 3, {
    isSensor: true,
  });
  body.label = "bullet";
  Matter.Body.setVelocity(body, v);

  const obj = new PIXI.Graphics(bulletGeometry);

  return {
    getDamage() { return damage; },
    body,
    renderer: obj,
  };
}

const shoot = (player, lookAt) => {
  console.log("player shoot at frame: ", frameCount, stepCount);
  const { add, sub, mult, normalise } = Matter.Vector;
  const playerPos = player.body.position;
  const velocity = mult(sub(lookAt, playerPos), 1 / 10);
  const shootPos = add(playerPos, mult(normalise(velocity), 10));
  return createBullet(shootPos, velocity);
}

let frameCount = 0;
let stepCount = 0;
const jump = (player, direction) => {
  const strength = 5;
  if (direction) {
    // right
    Body.setVelocity(player.body, v2(strength, -strength));
  } else {
    // left
    Body.setVelocity(player.body, v2(-strength, -strength));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const input = Input();
  window.addEventListener('keydown', function (evt) {
    input.keydown(Input.toKeyCode(evt));
  });
  window.addEventListener('keyup', e => {
    input.keyup(Input.toKeyCode(e));
  });
  // provide concave decomposition support library
  Common.setDecomp(require('poly-decomp'));

  // create engine
  const engine = Engine.create(),
    world = engine.world;

  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: 1,
      width: 800,
      height: 600,
    }
  });
  Render.run(render);

  const width = 800;
  const height = 600;

  const app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x000000,
    antialias: true,
  });
  document.body.appendChild(app.view);

  app.renderer.plugins.interaction.on('pointerup', e => {
    input.touchdown(e.data.getLocalPosition(terrainRenderer));
  });
  app.ticker.add(() => {
    const updatePosition = object => {
      const { body, renderer } = object;
      renderer.position.set(body.position.x, body.position.y);
      renderer.rotation = body.angle;
    }
    players.forEach(updatePosition);
    bullets.forEach(updatePosition);
    app.stage.pivot.x = clamp(0, 800, p1.renderer.position.x - width / 2);
    app.stage.pivot.y = clamp(0, 600, p1.renderer.position.y - height / 2);
  });
  // const runner = Matter.Runner.create({
  //   isFixed: true,
  //   delta: 1000 / 60,
  // });
  // Matter.Runner.run(runner, engine);

  // START HERE

  const playerCount = 2;
  const log = console.log

  let t;
  const client = socket.create((receiveObj) => {
    const receiveData = {
      serverAck: receiveObj.serverAck,
      players: receiveObj.players.map(converter.rframes),
    }
    t = ClientData.step(t, ClientData.receive(receiveData));
    // log("receive", stringify(receiveData));
  });
  const step = () => {
    t = ClientData.step(t, ClientData.addFrame(input.getCurrentInput()));
    input.reset();
    const payloads = ClientData.getFirstFrames(t); // could throw here
    gameLoop(payloads);
    t = ClientData.step(t, ClientData.consume);
  }
  let started = false;
  const startStreaming = (roomId, myIndex, startTime) => {
    if (started) return;
    started = true;
    log('start', myIndex);

    t = ClientData.nope(myIndex, playerCount);
    const dtEngine = 16;
    (function run() {
      const now = Date.now();
      if (now < startTime) {
        console.log("now", now, startTime);
        setTimeout(run, dtEngine);
        return;
      }
      let canStep = true;
      if (frameCount % 2 == 0) {
        try {
          step();
          stepCount++;
        } catch (e) {
          console.log("error", e);
          canStep = false;
        }
      }
      if (canStep) {
        Engine.update(engine, dtEngine);
        frameCount++;
      }

      const bufferSize = Math.min(...(t.playersFrames.map(f => f.payloads.length)))
      if (bufferSize > 3) {
        setTimeout(run, 0);
      } else {
        setTimeout(run, dtEngine);
      }

      if (stepCount % 3 === 0) {
        try {
          const sendData = ClientData.getSendData(t);
          const sendObj = new ClientSendT(
            sendData.myIndex,
            converter.frames(sendData.myFrames),
            sendData.otherAcks,
          );
          socket.send(client, roomId, sendObj);
          // log("send", stringify(sendObj));
        } catch (e) {
          log(stringify(e), 'its ok');
        }
      }
    })();
  }
  async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
  document.getElementById('find-match').onclick = async (e) => {
    postData(`http://${constants.host}:8080/find-match`, {
      name: document.getElementById('name').value,
    }).then(info => {
      console.log("fetched", info);
      const {
        id,
        maxPlayer,
        startTime,
        index,
        name,
      } = info;
      startStreaming(id, index, startTime);
    });
  }

  const map = createMap("asdklfjas");
  let terrain = Bodies.fromVertices(0, 0, map.getPath(), {
    isStatic: true,
  }, true);
  const terrainRenderer = new PIXI.Graphics();
  app.stage.addChild(terrainRenderer);
  terrain.label = "ground";
  const players = [];
  const addPlayer = player => {
    Composite.add(world, player.body);
    app.stage.addChild(player.renderer);
    players.push(player);
  }
  const p1 = createPlayer(v2(50, 50));
  const p2 = createPlayer(v2(200, 50));
  addPlayer(p1);
  addPlayer(p2);
  let bullets = [];
  const addBullet = bullet => {
    Composite.add(world, bullet.body);
    app.stage.addChild(bullet.renderer);
    bullets.push(bullet);
  }

  const refreshTerrain = () => {
    console.log("refreshTerrain");
    Composite.remove(world, terrain);
    terrain = Bodies.fromVertices(0, 0, map.getPath(), { isStatic: true, }, true);
    terrain.label = "ground";
    Matter.Body.setPosition(terrain, v2(-500 - terrain.bounds.min.x, 400 - terrain.bounds.max.y))
    Composite.add(world, terrain);

    terrainRenderer.clear();
    terrainRenderer.beginFill(0x666600);
    terrainRenderer.drawPolygon(...map.getPath().map(path => path.map(p => new PIXI.Point(p.x, p.y))));
    terrainRenderer.endFill();
  }

  const clipUpdate = (positions, radius) => {
    positions.forEach(pos => {
      map.clip(pos.x, pos.y, radius);
    })
    map.execute();
    refreshTerrain();
  }

  const damn = (body) => {
    if (!bullets.find(b => b.body === body)) return;
    Composite.remove(world, body);
    bullets = bullets.filter(b => b !== body);
    return body.position;
  }
  const toClipPos = p => ({
    x: p.x - terrain.bounds.min.x - 500,
    y: p.y - terrain.bounds.max.y + 400,
  });
  const hitPlayer = (body, damage) => {
    const player = players.find(p => p.body === body);
    console.log("damage", damage, player.getHp());
    player.mapHp(v => v - damage);
    console.log("damage", damage, player.getHp());
    if (player.getHp() <= 0) {
      console.log("player die");
      Composite.remove(world, body);
    }
  }
  Matter.Events.on(engine, "collisionStart", e => {
    const { pairs } = e;
    const clipPositions = pairs.map(pair => {
      const { bodyA, bodyB } = pair;
      if (bodyA.label === "bullet") {
        return damn(bodyA);
      }
      if (bodyB.label === "bullet") {
        return damn(bodyB);
      }
    }).filter(x => x);
    clipPositions.forEach(pos => {
      const hitbox = circle(pos.x, pos.y, 20);
      Matter.Query.collides(hitbox, players.map(p => p.body))
        .filter(query => query.collided)
        .forEach(query => {
          const { bodyA, bodyB } = query;
          console.log("collides", bodyA, bodyB, query);
          if (bodyA.label === "player") {
            hitPlayer(bodyA, 50);
          } else if (bodyB.label === "player") {
            hitPlayer(bodyB, 50);
          }
        });
    });
    if (clipPositions.length) {
      clipUpdate(clipPositions.map(toClipPos), 20);
    }
  });
  refreshTerrain();

  const gameLoop = (inputs) => {
    inputs.forEach((input, index) => {
      if (input.touches > 0) {
        console.log("input > 0", input);
        const mousePos = input.touchPos;
        const bullet = shoot(players[index], mousePos);
        addBullet(bullet);
      }
      if (input.keys.includes("a".charCodeAt(0))) {
        jump(players[index], 0);
      } else if (input.keys.includes("d".charCodeAt(0))) {
        jump(players[index], 1);
      }
    });
  }
});

