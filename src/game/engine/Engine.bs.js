// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Random = require("@rescript/std/lib/js/random.js");
var Belt_Array = require("@rescript/std/lib/js/belt_Array.js");
var Node$Netgame = require("./Node.bs.js");
var Vec2$Netgame = require("./Vec2.bs.js");

function carNode(param) {
  return {
          skills: {
            sprite: {
              src: "resource/police-car-siren-blue.png"
            },
            transform: {
              position: {
                x: Random.$$float(300),
                y: Random.$$float(300)
              },
              rotation: 0,
              scale: {
                x: 1,
                y: 1
              }
            },
            movable: {
              velocity: {
                x: 0,
                y: 0
              },
              acceleration: {
                x: 0,
                y: 0
              },
              maxSpeed: 200
            },
            carLike: {
              direction: Vec2$Netgame.create(0, -1),
              gas: /* No */0,
              steer: /* No */0,
              turnRate: -4,
              stats: {
                speed: 30,
                acceleration: 20,
                handle: 60
              }
            }
          },
          zOrder: 0,
          children: []
        };
}

function createWorld(playerCount) {
  return {
          nodes: Belt_Array.makeBy(playerCount, carNode)
        };
}

function step(world, inputs, dt) {
  return {
          nodes: Belt_Array.mapWithIndex(world.nodes, (function (index, node) {
                  return Node$Netgame.step(node, Belt_Array.getExn(inputs, index), dt);
                }))
        };
}

Random.init(Date.now());

exports.carNode = carNode;
exports.createWorld = createWorld;
exports.step = step;
/*  Not a pure module */
