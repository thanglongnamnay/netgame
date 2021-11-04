type state =
  | Preparing
  | Playing
  | Ended
type t = {
  state: state,
  players: array<Player.t>,
  bullets: list<Bullet.t>,
}
@deriving(accessors)
type action =
  | Start
  | AddPlayers(array<Player.t>)
  | RemovePlayer(Player.id)
  | AddBullet(Bullet.t)
  | RemoveBullet(Bullet.id)
  | PlayerAction(Player.id, Player.action)
  | BulletHit(Bullet.id, Player.id)

let make = () => {
  state: Preparing,
  players: [],
  bullets: list{},
}
let rec step = (t, action) =>
  switch action {
  | Start => {...t, state: Playing}
  | AddPlayers(players) => {...t, players: t.players->Belt.Array.concat(players)}
  | RemovePlayer(id) => {...t, players: t.players->Belt.Array.keep(p => p.id != id)}
  | AddBullet(bullet) => {...t, bullets: t.bullets->Belt.List.add(bullet)}
  | RemoveBullet(id) => {...t, bullets: t.bullets->Belt.List.keep(b => b.id != id)}
  | PlayerAction(id, action) => {
      ...t,
      players: t.players->Belt.Array.map(p => p.id == id ? p->Player.step(action) : p),
    }
  | BulletHit(bid, pid) =>
    try {
      let bullet = t.bullets->Belt.List.keep(b => b.id == bid)->Belt.List.headExn
      t->step(RemoveBullet(bid))->step(PlayerAction(pid, MapHp(hp => hp - bullet.damage)))
    } catch {
    | _ => t->Utils.effect(Js.log("| BulletHit => bullet not found"))
    }
  }
module Helper = {
  let findPlayer = (t, id) => t.players->Js.Array2.find(p => p.id == id)
  let playersMap = (t, fn) => t.players->Belt.Array.mapU(fn)
  let playersForEach = (t, fn) => t.players->Belt.Array.forEachU(fn)
  let bulletsMap = (t, fn) => t.bullets->Belt.List.mapU(fn)
  let bulletForEach = (t, fn) => t.bullets->Belt.List.forEachU(fn)
}
