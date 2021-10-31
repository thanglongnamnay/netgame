// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("@rescript/std/lib/js/curry.js");

function reduce(t, action) {
  switch (action.TAG | 0) {
    case /* MapPos */0 :
        var p = t.position;
        return {
                position: Curry._1(action._0, p),
                rotation: t.rotation,
                scale: t.scale
              };
    case /* MapRot */1 :
        var r = t.rotation;
        return {
                position: t.position,
                rotation: Curry._1(action._0, r),
                scale: t.scale
              };
    case /* MapScale */2 :
        var s = t.scale;
        return {
                position: t.position,
                rotation: t.rotation,
                scale: Curry._1(action._0, s)
              };
    
  }
}

exports.reduce = reduce;
/* No side effect */