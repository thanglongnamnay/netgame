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
const constants = require('../constants')

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
  const newRoom = Room.make(++roomId, MAX_PLAYER);
  rooms.push(newRoom);
  return newRoom;
}

app.post('/find-match', (req, res) => {
  const { name } = req.body;
  let room = findAvailableRoom();
  const { id, maxPlayer } = room;
  room = Room.addPlayer(room, {
    respond: (index, startTime) => {
      res.json({
        id,
        maxPlayer,
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
      roomId: id,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
