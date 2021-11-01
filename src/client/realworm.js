const Matter = require('matter-js');
const Merlin1d = require('./Merlin1d');
const ClipperLib = require('./clipper.js');
const socket = require("./socket");
const ClientData = require("../common/ClientData.bs");
const { ClientSendT } = require("../flat-models/client-send");
const converter = require("../converter");
const constants = require("../constants");
const PIXI = require('pixi.js');

const stringify = v => JSON.stringify(v, null, 2);
const Engine = Matter.Engine,
  Render = Matter.Render,
  Common = Matter.Common,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Composite = Matter.Composite,
  Body = Matter.Body,
  Bodies = Matter.Bodies;

function pathToSvg(paths, scale = 1) {
  var svgpath = "", i, j;
  for (i = 0; i < paths.length; i++) {
    for (j = 0; j < paths[i].length; j++) {
      if (!j) svgpath += "M";
      else svgpath += "L";
      svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
    }
    svgpath += "Z";
  }
  if (svgpath == "") svgpath = "M0,0";

  let svg = '<svg id="svg" style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="800" height="600">';
  svg += '<path stroke="black" fill="yellow" stroke-width="2" d="' + svgpath + '"/>';
  svg += '</svg>';
  document.getElementById("svg").innerHTML = svg;
}
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
const logic = new WeakMap();
const getLogic = b => logic.get(b);
const renderObject = new WeakMap();
const getRenderObject = b => renderObject.get(b);

const playerGeometry = new PIXI.GraphicsGeometry();
const playerFill = new PIXI.FillStyle();
playerFill.color = 0xaaaa00;
playerFill.visible = true;
playerGeometry.drawShape(new PIXI.Rectangle(0, 0, 10, 10), playerFill, new PIXI.LineStyle(), new PIXI.Matrix());

const createPlayer = (p, options = {}) => {
  let { hp } = {
    hp: 1,
    ...options,
  };
  const body = Matter.Bodies.rectangle(p.x, p.y, 10, 10);
  body.label = "player";
  Matter.Body.setInertia(body, 200);
  logic.set(body, {
    getHp() { return hp; },
    mapHp(f) { hp = f(hp); },
    getBody() { return body; }
  });

  const obj = new PIXI.Graphics(playerGeometry);
  renderObject.set(body, obj);

  return body;
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

  logic.set(body, {
    getDamage() { return damage; },
    getBody() { return body; },
  });

  renderObject.set(body, new PIXI.Graphics(bulletGeometry));

  return body;
}

const shoot = (player, lookAt) => {
  console.log("player shoot at frame: ", frameCount, stepCount);
  const { add, sub, mult, normalise } = Matter.Vector;
  const playerPos = player.position;
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
    Body.setVelocity(player, v2(strength, -strength));
  } else {
    // left
    Body.setVelocity(player, v2(-strength, -strength));
  }
}

window.addEventListener('DOMContentLoaded', () => {

  // provide concave decomposition support library
  Common.setDecomp(require('poly-decomp'));

  // create engine
  const engine = Engine.create(),
    world = engine.world;


  const width = 800;
  const height = 600;
  // create renderer
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: 1,
      width,
      height,
    }
  });
  Render.run(render);

  const app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x000000,
  });
  app.ticker.add(() => {
    const updatePosition = body => {
      const obj = getRenderObject(body);
      obj.position.set(body.position.x, body.position.y);
      obj.rotation = body.angle;
    }
    players.forEach(updatePosition);
    bullets.forEach(updatePosition);
  });
  document.body.appendChild(app.view);
  const runner = Matter.Runner.create({
    isFixed: true,
    delta: 1000 / 60,
  });
  Matter.Runner.run(runner, engine);

  // START HERE

  const playerCount = 2;
  let curTouch = 0;
  let curPos = { x: 0, y: 0 };
  const currentKeys = new Set();
  const toKeyCode = e => {
    switch (e.code) {
      case "KeyS":
      case "ArrowDown":
        return 's'.charCodeAt(0);
      case "KeyW":
      case "ArrowUp":
        return 'w'.charCodeAt(0);
      case "KeyA":
      case "ArrowLeft":
        return 'a'.charCodeAt(0);
      case "KeyD":
      case "ArrowRight":
        return 'd'.charCodeAt(0);
    }
  }
  window.addEventListener('keydown', function (evt) {
    console.log("onkeydown", evt.code);
    currentKeys.add(toKeyCode(evt));
  });
  window.addEventListener('keyup', e => {
    console.log("onkeyup", e.code);
    currentKeys.delete(toKeyCode(e));
  });
  const getCurrentInput = () => {
    const keys = Array.from(currentKeys.values());
    return {
      touches: curTouch,
      touchPos: curTouch ? curPos : { x: 0, y: 0 },
      keys,
    }
  }
  const log = console.log
  const dt = 1000 / 30;
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
    t = ClientData.step(t, ClientData.addFrame(getCurrentInput()));
    if (curTouch > 0) {
      console.log("add shoot at frame", frameCount, stepCount);
    }
    curTouch = 0; // reset inputs
    currentKeys.clear();
    const payloads = ClientData.getFirstFrames(t); // could throw here
    gameLoop(dt, payloads);
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
  let terrain = Bodies.fromVertices(0, 400, map.getPath(), {
    isStatic: true,
    render: {
      fillStyle: '#ffffff',
      strokeStyle: '#060a19',
      lineWidth: 1
    }
  }, true);
  terrain.label = "ground";
  const players = [];
  const addPlayer = player => {
    Composite.add(world, player);
    app.stage.addChild(getRenderObject(player));
    players.push(player);
  }
  const p1 = createPlayer(v2(50, 50));
  const p2 = createPlayer(v2(200, 50));
  addPlayer(p1);
  addPlayer(p2);
  let bullets = [];
  const addBullet = bullet => {
    Composite.add(world, bullet);
    app.stage.addChild(getRenderObject(bullet));
    bullets.push(bullet);
  }

  const refreshTerrain = () => {
    Composite.remove(world, terrain);
    terrain = Bodies.fromVertices(0, 0, map.getPath(), {
      isStatic: true,
      render: {
        fillStyle: '#ffffff',
        strokeStyle: '#060a19',
        lineWidth: 0
      }
    }, true);
    terrain.label = "ground";
    Matter.Body.setPosition(terrain, v2(-500 + terrain.position.x - terrain.bounds.min.x, 400 + terrain.position.y - terrain.bounds.max.y))
    Composite.add(world, terrain);
  }

  const clipUpdate = (positions, radius) => {
    positions.forEach(pos => {
      map.clip(pos.x, pos.y, radius);
    })
    map.execute();
    refreshTerrain();
  }

  const checkCollide = () => {
    const collisions = Matter.Query.collides(terrain, bullets);
    if (!collisions.length) return;
    console.log(collisions)
    const clipPositions = collisions.map(collision => {
      const body = collision.bodyA;
      return {
        x: body.position.x - terrain.bounds.min.x - 500,
        y: body.position.y - terrain.bounds.max.y + 400,
      }
    });
    clipUpdate(clipPositions, 40);
    const hitBodies = collisions.map(collision => collision.bodyA);
    hitBodies.forEach(body => Composite.remove(world, body));
    hitBodies.forEach(body => {
      console.log(bullets.filter(b => b === body))
      bullets = bullets.filter(b => b !== body);
    });
  }

  const damn = (body) => {
    if (!bullets.includes(body)) return;
    Composite.remove(world, body);
    bullets = bullets.filter(b => b !== body);
    return body.position;
  }
  const toClipPos = p => ({
    x: p.x - terrain.bounds.min.x - 500,
    y: p.y - terrain.bounds.max.y + 400,
  });
  const hitPlayer = (body, damage) => {
    const player = getLogic(body);
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
      Matter.Query.collides(hitbox, players)
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
    clipUpdate(clipPositions.map(toClipPos), 20);
  });
  refreshTerrain();

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constrain: {
      stiffness: 0.2,
    },
  });
  Composite.add(world, mouseConstraint);
  render.mouse = mouse;
  Matter.Events.on(mouseConstraint, 'mousedown', e => {
    curTouch = 1;
    curPos = { ...e.source.mouse.position };
    curPos.x = curPos.x | 0;
    curPos.y = curPos.y | 0;
    console.log("mousedown", curTouch, curPos);
  });
  const gameLoop = (dt, inputs) => {
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
  Matter.Events.on(engine, 'afterUpdate', e => {
    Render.lookAt(render, p1, v2(300, 300));
  });

  // Render.lookAt(render, {
  //   min: { x: 0, y: 0 },
  //   max: { x: 400, y: 300 }
  // });
});

