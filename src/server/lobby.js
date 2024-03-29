/**
 * lobby server
 * create a lobby
 * player find room -> get available room -> join
 * start 5 sec after room full
 * send room uuid, start time, playerIndex back to players
 * could use tcp or long polling, let's do long polling
 *
 * battle server
 * players will send uuid to server in every package
 * broadcast client msg to all rooms
 * room will discard msg with different uuid
 * proceed
 */

const express = require('express');
const childProcess = require('child_process');
const Room = require('./Room.bs');
const constants = require('../constants');

// create application/json parser

const battleServer = childProcess.fork(__dirname + '/socket.js');
console.log("forked");
const app = express();
const port = 8080;

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

let roomId = 0;
const rooms = [];
const replaceRoom = (id, room) => {
  rooms[rooms.findIndex(r => r.id === id)] = room;
}
const removeRoom = id => {
  rooms.splice(rooms.findIndex(r => r.id === id), 1);
}

const MAX_PLAYER = 2;
const findAvailableRoom = () => {
  const notFullRooms = rooms.filter(r => !Room.isFull(r));
  if (notFullRooms[0]) return notFullRooms[0];
  const newRoom = Room.make(++roomId, (Math.random() + 1).toString(36).substring(7), MAX_PLAYER);
  rooms.push(newRoom);
  return newRoom;
}

app.post('/find-match', (req, res) => {
  const { name } = req.body;
  let room = findAvailableRoom();
  const { id, seed, maxPlayer } = room;
  const players = Array(maxPlayer).fill(0).map((_, i) => ({
    id: i,
    position: { x: i == 0 ? 50 : 200, y: 50 },
  }));
  room = Room.addPlayer(room, {
    id,
    index: room.players.length,
    name,
    position: { x: room.players.length == 0 ? 50 : 200, y: 50 },
    respond: (index, startTime) => {
      res.json({
        id,
        seed,
        players,
        startTime,
        index,
        name,
      });
    }
  });
  replaceRoom(id, room);
  console.log(`${name} find match, room is`, room, room.players.length);
  if (Room.isFull(room)) {
    room.players.forEach((player, index) => {
      player.respond(index, Date.now() + 1000);
    });
    removeRoom(id);
    battleServer.send({
      id: constants.makeRoom,
      info: room,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
