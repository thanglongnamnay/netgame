"use strict";
exports.__esModule = true;
exports.spriteCache = void 0;
var spriteCache = new Map();
exports.spriteCache = spriteCache;
window.addEventListener('DOMContentLoaded', function () {
    var images = Array.from(document.getElementsByClassName("preload"));
    console.log("spriteCache", images);
    images.forEach(function (img) {
        img.onload = function () {
            console.log("img", img.width, img.height);
            window.createImageBitmap(img).then(function (sprite) {
                console.log("cache", img.src);
                spriteCache.set(img.src.slice(img.src.indexOf("resource")), sprite);
            });
        };
    });
});
//# sourceMappingURL=sprite-cache.js.map