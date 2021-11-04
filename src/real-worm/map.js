const Matter = require('matter-js');
const Merlin1d = require('./Merlin1d');
const ClipperLib = require('./clipper.js');

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

exports.createMap = createMap;