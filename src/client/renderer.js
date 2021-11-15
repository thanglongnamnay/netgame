
const PIXI = require('pixi.js');

const playerGeometry = new PIXI.GraphicsGeometry();
const playerFill = new PIXI.FillStyle();
playerFill.color = 0xaaaa00;
playerFill.visible = true;
playerGeometry.drawShape(new PIXI.Rectangle(-10, -10, 20, 20), playerFill, new PIXI.LineStyle(), new PIXI.Matrix());

const bulletGeometry = new PIXI.GraphicsGeometry();
bulletGeometry.drawShape(new PIXI.Circle(0, 0, 5), playerFill, new PIXI.LineStyle(), new PIXI.Matrix());

const clamp = (a, b, x) => x < a ? a : (x > b ? b : a);
const limitVec2 = (v, maxLen) => {
  const length = Math.sqrt(v.x * v.x + v.y * v.y);
  if (length <= maxLen) return v;
  const m = maxLen / length;
  return new PIXI.Point(v.x * m, v.y * m);
}
const subtract = (a, b) => new PIXI.Point(a.x - b.x, a.y - b.y);
const Renderer = (app, physics, myIndex) => {
  const { width, height } = app;
  const objects = {
    players: [],
    bullets: [],
    background: PIXI.Sprite.from('resource/table-small.jpeg'),
    terrain: new PIXI.Graphics(),
    terrainBorder: new PIXI.Graphics(),
    indicator: new PIXI.Graphics(),
  };
  // objects.background.tint = 0x555555;
  // objects.background.scale.set(0.25, 0.2 5);
  app.stage.addChild(objects.background);
  app.stage.addChild(objects.terrainBorder);
  app.stage.addChild(objects.terrain);
  app.stage.addChild(objects.indicator);
  const onMouse = e => {
    const player = objects.players[myIndex];
    const { indicator } = objects;
    indicator.clear();
    indicator.lineStyle({
      width: 2,
      color: 0xffffff,
      alpha: 0.6,
    });
    if (player) {
      const direction = limitVec2(subtract(e.data.getLocalPosition(objects.terrain), player.position), 150);
      // const direction = e.data.getLocalPosition(objects.terrain);
      indicator.beginFill(0xffffff);
      indicator.moveTo(0, 0);
      indicator.lineTo(direction.x, direction.y);
      indicator.endFill();
    }
  }
  app.renderer.plugins.interaction.on('pointerenter', onMouse);
  app.renderer.plugins.interaction.on('pointermove', onMouse);
  app.ticker.add(() => {
    physics.getBodies().players.forEach(body => {
      const id = body.playerId;
      let player = objects.players.find(p => p.playerId === id);
      if (!player) {
        player = addPlayer(id);
      }
      player.position.set(body.position.x, body.position.y);
      player.rotation = body.angle;
    });
    physics.getBodies().bullets.forEach(body => {
      const id = body.bulletId;
      let bullet = objects.bullets.find(p => p.bulletId === id);
      if (!bullet) {
        bullet = addBullet(id);
      }
      bullet.position.set(body.position.x, body.position.y);
      bullet.rotation = body.angle;
    });

    const pos = objects.players[myIndex]?.position;
    if (pos) {
      app.stage.pivot.x = clamp(0, 800, pos.x - width / 2);
      app.stage.pivot.y = clamp(0, 600, pos.y - height / 2);
      objects.indicator.position.set(pos.x, pos.y);
    }
  });

  const addPlayer = id => {
    // const obj = new PIXI.Graphics(playerGeometry);
    const obj = PIXI.Sprite.from('resource/square1.png');
    obj.anchor.set(0.5, 0.5);
    obj.playerId = id;
    objects.players.push(obj);
    app.stage.addChild(obj);
    return obj;
  }
  const removePlayer = id => {
    objects.players
      .filter(p => p.playerId === id)
      .map(b => b.destroy());
    objects.players = objects.players.filter(p => p.playerId !== id);
  }
  const addBullet = id => {
    // const obj = new PIXI.Graphics(bulletGeometry);
    const obj = PIXI.Sprite.from('resource/bullet.png');
    obj.bulletId = id;
    objects.bullets.push(obj);
    app.stage.addChild(obj);
    return obj;
  }
  const removeBullet = id => {
    objects.bullets
      .filter(p => p.bulletId === id)
      .map(b => b.destroy());
    objects.bullets = objects.bullets.filter(p => p.bulletId !== id);
  }
  const borderMatrix = PIXI.Matrix.IDENTITY
    .translate(-300, -400)
    .scale(1.015, 1.015)
    .translate(300, 400);
  const refreshTerrain = (map = physics.getMap()) => {
    console.log("renderer.refreshTerrain", map);
    const terrainRenderer = objects.terrain;
    terrainRenderer.clear();
    terrainRenderer.beginTextureFill({
      texture: PIXI.Texture.from('resource/background.jpeg'),
      // color: 0xaaaa00,
    });
    map.getPath().forEach(path => terrainRenderer.drawPolygon(path));
    terrainRenderer.endFill();
    const terrainBorder = objects.terrainBorder;
    terrainBorder.clear();
    terrainBorder.beginTextureFill({
      texture: PIXI.Texture.WHITE,
      color: 0x0055ff,
      alpha: 0.4,
    });
    map.getPath().map(path => path.map(p => borderMatrix.apply(p)))
      .forEach(path => terrainBorder.drawPolygon(path));
    terrainBorder.endFill();
  }

  return {
    getObjects: () => objects,
    addPlayer,
    removePlayer,
    addBullet,
    removeBullet,
    refreshTerrain,
  }
}

Renderer.getObjects = r => (...args) => r.getObjects(...args);
Renderer.addPlayer = r => (...args) => r.addPlayer(...args);
Renderer.removePlayer = r => (...args) => r.removePlayer(...args);
Renderer.addBullet = r => (...args) => r.addBullet(...args);
Renderer.removeBullet = r => (...args) => r.removeBullet(...args);
Renderer.refreshTerrain = r => (...args) => r.refreshTerrain(...args);

module.exports.Renderer = Renderer;