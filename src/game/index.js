"use strict";
exports.__esModule = true;
exports.make = void 0;
var Engine = require("./engine/Engine.bs");
var sprite_cache_1 = require("./sprite-cache");
var colors = ['white', 'green', 'blue', 'cyan'];
function make(playerCount, canvas) {
    var context = canvas.getContext("2d");
    var drawSprite = function (sprite, transform) {
        if (!sprite) {
            console.log("wow");
            return;
        }
        var position = transform.position, rotation = transform.rotation, scale = transform.scale;
        var dWidth = scale.x * sprite.width;
        var dHeight = scale.y * sprite.height;
        var oldTransform = context.getTransform();
        context.translate(position.x, position.y);
        context.scale(scale.x, scale.y);
        context.rotate(rotation);
        context.drawImage(sprite, -dWidth / 2, -dHeight / 2, dWidth, dHeight);
        context.setTransform(oldTransform);
    };
    var renderSprite = function (node) {
        var sprite = node.skills.sprite;
        var transform = node.skills.transform;
        if (!sprite || !transform) {
            console.log("null", sprite, transform);
            return false;
        }
        drawSprite(sprite_cache_1.spriteCache.get(sprite.src), transform);
        return true;
    };
    var renderNode = function (node, i) {
        console.log("renderNode", i, node);
        var transform = node.skills.transform;
        var position = transform.position, rotation = transform.rotation, scale = transform.scale;
        var oldTransform = context.getTransform();
        context.translate(position.x, position.y);
        context.scale(scale.x, scale.y);
        context.rotate(rotation);
        context.beginPath();
        context.arc(0, 0, 20, 0, Math.PI * 2);
        context.fillStyle = colors[i];
        context.fill();
        context.setTransform(oldTransform);
    };
    var render = function (world) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var _i = 0, _a = world.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            renderSprite(node);
        }
    };
    var world = Engine.createWorld(playerCount);
    function mainLoop(dt, inputs) {
        console.log("mainLoop", dt, inputs, world);
        world = Engine.step(world, inputs, dt);
        render(world);
    }
    ;
    return mainLoop;
}
exports.make = make;
//# sourceMappingURL=index.js.map