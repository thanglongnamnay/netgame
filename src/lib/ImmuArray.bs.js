// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("@rescript/std/lib/js/curry.js");
var Belt_Array = require("@rescript/std/lib/js/belt_Array.js");

function make(arr) {
  return arr.slice(0);
}

function length(prim) {
  return prim.length;
}

function isEmpty(t) {
  return t.length === 0;
}

function head(t) {
  return Belt_Array.get(t, 0);
}

function tail(t) {
  if (t.length === 0) {
    return [];
  } else {
    return t.slice(1);
  }
}

function cons(t, a) {
  return [a].concat(t);
}

function append(t, a) {
  return t.concat([a]);
}

function commitChanges(mutArr) {
  return mutArr;
}

function batchUpdate(immArr, callback) {
  return Curry._2(callback, immArr.slice(0), commitChanges);
}

var toArray = make;

var sliceFrom = Belt_Array.sliceToEnd;

var concat = Belt_Array.concat;

var map = Belt_Array.map;

var getExn = Belt_Array.getExn;

exports.make = make;
exports.length = length;
exports.isEmpty = isEmpty;
exports.head = head;
exports.tail = tail;
exports.toArray = toArray;
exports.sliceFrom = sliceFrom;
exports.concat = concat;
exports.map = map;
exports.cons = cons;
exports.append = append;
exports.batchUpdate = batchUpdate;
exports.getExn = getExn;
/* No side effect */
