type status = Preparing | Playing
type t = {
  status: status,
  players: Belt.Map.Int.t<PlayerData.t>,
}
type action =
  | Play
  | AddPlayer(PlayerData.t)
  | RemovePlayer(int)
  | PlayerData(int, PlayerData.action)
let newMatch = {
  status: Preparing,
  players: Belt.Map.Int.fromArray([]),
}
let mapPlayer = (t, id, fn) => {
  open Belt.Map.Int
  let {status, players} = t
  let players = switch players->get(id) {
  | Some(v) => players->set(id, fn(v))
  | None => players
  }
  {status: status, players: players}
}
let mapPlayers = (t, fn) => {
  status: t.status,
  players: fn(t.players),
}
let doWhilePreparing = (t, fn) =>
  switch t.status {
  | Playing => t
  | Preparing => fn(t)
  }
let step = (t, action) =>
  switch action {
  | Play => {
      status: Playing,
      players: t.players,
    }
  | AddPlayer(player) => t->doWhilePreparing(mapPlayers(_, Belt.Map.Int.set(_, player.id, player)))
  | RemovePlayer(id) => t->mapPlayers(Belt.Map.Int.remove(_, id))
  | PlayerData(id, action) => t->mapPlayer(id, PlayerData.step(_, action))
  }
