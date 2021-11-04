type id = int
type damage = int
type t = {
  id: int,
  damage: int,
}
let make = (~id, ~damage) => {
  id: id,
  damage: damage,
}
