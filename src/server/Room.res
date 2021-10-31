type player
type t = {
  id: int,
  maxPlayer: int,
  players: array<player>,
}
let make = (id, maxPlayer) => {
  id: id,
  maxPlayer: maxPlayer,
  players: [],
}
let isFull = t => t.players->Belt.Array.length >= t.maxPlayer
let addPlayer = (t, player) => {
  ...t,
  players: t.players->Belt.Array.concat([player]),
}
