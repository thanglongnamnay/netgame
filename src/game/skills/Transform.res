@unboxed type position = Position(Vec2.t)
@unboxed type rotation = Rotation(float)
@unboxed type scale = Scale(Vec2.t)
type t = {
  position: position,
  rotation: rotation,
  scale: scale,
}
type action =
  | MapPos(Vec2.t => Vec2.t)
  | MapRot(float => float)
  | MapScale(Vec2.t => Vec2.t)

let reduce = (t, action) =>
  switch action {
  | MapPos(map) => {
      let Position(p) = t.position
      {...t, position: Position(map(p))}
    }
  | MapRot(map) => {
      let Rotation(r) = t.rotation
      {...t, rotation: Rotation(map(r))}
    }
  | MapScale(map) => {
      let Scale(s) = t.scale
      {...t, scale: Scale(map(s))}
    }
  }
