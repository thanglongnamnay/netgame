let server = NodeJs.Dgram.Socket.make(#udp4)
let playerCount = 2
let t = ref(ServerRoom.nope(playerCount))
let rinfoMap = Belt.HashMap.Int.make(~hintSize=playerCount)
server
->NodeJs.Dgram.Socket.on(
  #error(
    err => {
      Js.log2("Socket error", err)
      server->NodeJs.Dgram.Socket.close()
    },
  ),
)
->NodeJs.Dgram.Socket.on(
  #listening(
    () => {
      Js.log("Socket listening")
    },
  ),
)
->NodeJs.Dgram.Socket.on(
  #message(
    (msg, rinfo) => {
      let data = msg->Rebuffers.read(ClientRoom.sendSchema)->ClientRoom.deserializeSend
      Js.log3("server got", rinfo, data)
      rinfoMap->Belt.HashMap.Int.set(data.myIndex, rinfo)
      t := t.contents->ServerRoom.step(Receive(data))
    },
  ),
)
->NodeJs.Dgram.Socket.bind(~port=41234, ())
Window.setInterval(() => {
  t.contents
  ->ServerRoom.getSendData
  ->Belt.Array.forEachWithIndex((playerIndex, sendData) => {
    switch rinfoMap->Belt.HashMap.Int.get(playerIndex) {
    | Some(rinfo) => {
        let pack = sendData->ClientRoom.serializeReceive->Rebuffers.pack
        server->NodeJs.Dgram.Socket.send(
          #Buffer(pack),
          ~port=rinfo.port,
          ~address=rinfo.address,
          (),
        )
      }
    | None => Js.log("wtf?")
    }
  })
}, 1000. /. 1.)->ignore
server->NodeJs.Dgram.Socket.bind(~port=41234, ())
