const Socket = require("./socket");
const ClientData = require("../data-frame/ClientRoom.bs");

const log = console.log;
const stringify = v => JSON.stringify(v, null, 2);
const Network = (input, gameLoop, roomId, myIndex, playerCount) => {
  let t = ClientData.nope(myIndex, playerCount);
  const client = Socket.create(buffer => {
    const receiveData = ClientData.readReceive(buffer);
    t = ClientData.step(t, ClientData.receive(receiveData));
    // log("receive", stringify(receiveData));
  });
  const step = () => {
    t = ClientData.step(t, ClientData.addFrame(input.getCurrentInput()));
    input.reset();
    const payloads = ClientData.getFirstFrames(t); // could throw here
    gameLoop(payloads);
    t = ClientData.step(t, ClientData.consume);
  }
  const sendUpdate = () => {
    try {
      const sendDataRaw = ClientData.getSendDataRaw(t);
      Socket.sendRaw(client, roomId, sendDataRaw);

    } catch (e) {
      log(e, 'its ok');
    }
  }
  const bufferSize = () => Math.min(...(t.playersFrames.map(f => f.payloads.length)));

  return {
    getT: () => t,
    step,
    sendUpdate,
    bufferSize,
  }
}

module.exports.Network = Network;