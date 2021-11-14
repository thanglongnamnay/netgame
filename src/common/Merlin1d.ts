import * as Random from './random'
const interpolate = (s1: number, s2: number, blend: number) => {
  const blend2 = (1 - Math.cos(blend * Math.PI)) * 0.5;
  return s1 * (1 - blend2) + s2 * blend2;
}
const perlin1d = (seeds: number[], octaves: number, bias: number) => {
  const count = seeds.length;
  const output = [];
  for (let x = 0; x < count; x++) {
    let noise = 0.0;
    let totalScale = 0.0;
    let scale = 1.0;

    for (let o = 0; o < octaves; o++) {
      const pitch = count >> o;
      const sample1 = (x / pitch | 0) * pitch | 0;
      const sample2 = (sample1 + pitch | 0) % count | 0;
      const blend = (x - sample1) / pitch;
      //			const sample = (1.0 - blend) * seeds[sample1] + blend * seeds[sample2];
      const sample = interpolate(seeds[sample1], seeds[sample2], blend);
      totalScale += scale;
      noise += sample * scale;
      scale /= bias;
    }
    output[x] = noise / totalScale;
  }
  return output;
}
export const createMerlin = (seed: string, x: number) => {
  const rand = Random.makeS(seed);
  // const rand = Math.random;
  const noiseSeeds = Array(x).fill(0).map(i => rand());
  noiseSeeds[0] = 0.5;
  const fsurface = perlin1d(noiseSeeds, Math.log2(x) | 0, 1.5 + noiseSeeds[1]);
  return fsurface;
}