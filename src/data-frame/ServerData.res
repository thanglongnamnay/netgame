open Belt.HashMap.Int

let serverData: t<PlayerData.t> = make(~hintSize=4) // map from id to player
let getPlayer = id => serverData->get(id)
let addPlayer = (rInfo: Socket.rInfo) => {
  let id = Socket.hashId(rInfo)
  let player: PlayerData.t = {
    id: id,
    clientAck: -1,
    frames: {
      end: -1,
      payloads: []->ImmuArray.make,
    },
  }
  serverData->set(id, player)
  player
}
let removePlayer = serverData->remove
let discardAcked = ack => {
  // this is effect aswell
  serverData
  ->valuesToArray
  ->Belt.Array.forEach(playerData => {
    let playerData = playerData->PlayerData.step(Frames(RemoveFrom(ack)))
    if playerData.frames.payloads->ImmuArray.length == 0 {
      serverData->remove(playerData.id)
    } else {
      serverData->set(playerData.id, playerData)
    }
  })
}
let receivePlayerData = (playerReceiveData: PlayerData.t) => {
  // this is effect, return unit
  switch getPlayer(playerReceiveData.id) {
  | None => ()
  | Some(playerData) =>
    // need to calculate new playerData, by concat 2 data
    // and update what they know so we dont fucking resend data
    if playerData.clientAck > playerReceiveData.clientAck {
      () // probably an old packet, discard
    } else {
      let playerData =
        playerData
        ->PlayerData.step(Frames(Concat(playerReceiveData.frames)))
        ->PlayerData.step(Ack(playerReceiveData.clientAck))
      serverData->set(playerData.id, playerData)
    }
  }
}
let getFirstFrames = t =>
  t
  ->Belt.HashMap.Int.valuesToArray
  ->Belt.Array.map(p => p.PlayerData.frames)
  ->Belt.Array.map(Frames.getFirstFrame)
  ->Belt.Array.map(Belt.Option.getExn)
