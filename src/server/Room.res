type player
type t = {
  id: int,
  seed: string,
  maxPlayer: int,
  players: array<player>,
}
let make = (id, seed, maxPlayer) => {
  id: id,
  seed: seed,
  maxPlayer: maxPlayer,
  players: [],
}
let isFull = t => t.players->Belt.Array.length >= t.maxPlayer
let addPlayer = (t, player) => {
  ...t,
  players: t.players->Belt.Array.concat([player]),
}
