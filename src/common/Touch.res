type pos = {
  x: float,
  y: float,
}
@deriving(accessors)
type t = Up | Down(pos)

let getPos = mouse =>
  switch mouse {
  | Up => None
  | Down(pos) => Some(pos)
  }

let isMouseUp = mouse =>
  switch mouse {
  | Up => true
  | Down(_) => false
  }
let isMouseDown = mouse => !isMouseUp(mouse)
