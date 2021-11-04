const { RealWormClient } = require('./game');
const constants = require("../constants");

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
window.addEventListener('DOMContentLoaded', function () {
  const game = RealWormClient();

  document.getElementById('find-match').onclick = async (e) => {
    postData(`http://${constants.host}:8080/find-match`, {
      name: document.getElementById('name').value,
    }).then(info => {
      console.log("fetched", info);
      const {
        id,
        players,
        startTime,
        index,
        name,
      } = info;
      game.startStreaming(id, index, startTime, players);
    });
  }
});