// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Fs = require("fs");
var Curry = require("rescript/lib/js/curry.js");
var Caml_obj = require("rescript/lib/js/caml_obj.js");
var FastGlob = require("fast-glob");
var Belt_Array = require("rescript/lib/js/belt_Array.js");
var Promise2$Netgame = require("./Promise2.bs.js");
var CodeFrame = require("@babel/code-frame");

var dirname = typeof __dirname === "undefined" ? undefined : __dirname;

var dirname$1 = dirname !== undefined ? dirname : "";

function cleanUpStackTrace(stack) {
  var removeInternalLines = function (lines, _i) {
    while(true) {
      var i = _i;
      if (i >= lines.length) {
        return lines;
      }
      if (lines[i].indexOf(" (node:") >= 0) {
        return lines.slice(0, i);
      }
      _i = i + 1 | 0;
      continue ;
    };
  };
  return removeInternalLines(stack.split("\n").slice(2), 0).map(function (line) {
                return line.slice(2);
              }).join("\n");
}

function run(loc, left, comparator, right) {
  var match = loc[0];
  var line = match[1];
  var file = match[0];
  if (Curry._2(comparator, left, right)) {
    console.log("\u001b[36mPassed:", "\u001b[39m" + loc[1]);
  } else {
    Promise2$Netgame.map(Promise2$Netgame.flatMap(Promise2$Netgame.map(FastGlob("src/**/" + file + ".res"), (function (__x) {
                    return Belt_Array.getExn(__x, 0);
                  })), (function (__x) {
                return Curry._2(Fs.promise.readFile, __x, {
                            encoding: "utf-8"
                          });
              })), (function (fileContent) {
            var left$1 = JSON.stringify(left);
            var right$1 = JSON.stringify(right);
            var codeFrame = CodeFrame.codeFrameColumns(fileContent, {
                  start: {
                    line: line
                  }
                }, {
                  highlightCode: true
                });
            var errorMessage = "\n  \u001b[31mTest Failure!\n  \u001b[36m" + file + "\u001b[0m:\u001b[2m" + line + "\n\n" + codeFrame + "\n\n  \u001b[39mActual: \u001b[31m" + left$1 + "\n  \u001b[39mExpected: \u001b[31m" + right$1 + "\u001b[0m\n";
            console.log(errorMessage);
            var obj = {};
            Error.captureStackTrace(obj);
            console.log(cleanUpStackTrace(obj.stack));
            
          }));
  }
  
}

var equal = Caml_obj.caml_equal;

exports.dirname = dirname$1;
exports.cleanUpStackTrace = cleanUpStackTrace;
exports.run = run;
exports.equal = equal;
/* dirname Not a pure module */
