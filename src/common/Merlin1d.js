"use strict";
exports.__esModule = true;
exports.createMerlin = void 0;
var Random = require("./random");
var interpolate = function (s1, s2, blend) {
    var blend2 = (1 - Math.cos(blend * Math.PI)) * 0.5;
    return s1 * (1 - blend2) + s2 * blend2;
};
var perlin1d = function (seeds, octaves, bias) {
    var count = seeds.length;
    var output = [];
    for (var x = 0; x < count; x++) {
        var noise = 0.0;
        var totalScale = 0.0;
        var scale = 1.0;
        for (var o = 0; o < octaves; o++) {
            var pitch = count >> o;
            var sample1 = (x / pitch | 0) * pitch | 0;
            var sample2 = (sample1 + pitch | 0) % count | 0;
            var blend = (x - sample1) / pitch;
            var sample = interpolate(seeds[sample1], seeds[sample2], blend);
            totalScale += scale;
            noise += sample * scale;
            scale /= bias;
        }
        output[x] = noise / totalScale;
    }
    return output;
};
var createMerlin = function (seed, x) {
    var rand = Random.makeS(seed);
    var noiseSeeds = Array(x).fill(0).map(function (i) { return rand(); });
    noiseSeeds[0] = 0.5;
    var fsurface = perlin1d(noiseSeeds, Math.log2(x) | 0, 1.5 + noiseSeeds[1]);
    return fsurface;
};
exports.createMerlin = createMerlin;
//# sourceMappingURL=Merlin1d.js.map