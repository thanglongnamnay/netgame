type t = {
  x: float,
  y: float,
}
let zero = {
  x: 0.,
  y: 0.,
}
let create = (x, y) => {
  x: x,
  y: y,
}
let plus = (a, b) => {
  x: a.x +. b.x,
  y: a.y +. b.y,
}
let minus = (a, b) => {
  x: a.x -. b.x,
  y: a.y -. b.y,
}
let mult = (a, k) => {
  x: a.x *. k,
  y: a.y *. k,
}
let rotate = (a, alpha) => {
  let sinA = sin(alpha)
  let cosA = cos(alpha)
  {
    x: cosA *. a.x -. sinA *. a.y,
    y: sinA *. a.x +. cosA *. a.y,
  }
}
let mag2 = a => a.x *. a.x +. a.y *. a.y
let mag = a => sqrt(mag2(a))
let norm = a => {
  let magA = mag(a)
  if magA == 0. {
    zero
  } else {
    a->mult(1. /. mag(a))
  }
}
let lerp = (a, b, v) => {
  x: (a.x +. b.x) *. v,
  y: (a.y +. b.y) *. v,
}
let dot = (a, b) => a.x *. b.x +. a.y *. b.y
