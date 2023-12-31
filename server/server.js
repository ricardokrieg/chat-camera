const {WebSocketServer} = require('ws');
const {isEmpty} = require('lodash');

const Lobby = require('./Lobby');
const User = require('./User');
const Bot = require('./Bot');

function onError(ws, err) {
  console.error(`onError`, err);
}

function onClose(ws) {
  console.error(`onClose`);

  if (ws.botterId) {
    lobby.removeBots(ws.botterId);
  } else if (ws.userId) {
    try {
      lobby.removeUser(ws.userId);
    } catch (err) {
      console.error(err);
    }
  }
}

function onMessage(ws, rawData) {
  console.log(`Message Received: ${rawData}`);

  const data = JSON.parse(rawData);

  if (data.type === `skip`) {
    if (ws.botterId) {
      try {
        lobby.resetBot(data.id);
      } catch (err) {
        console.error(err);
      }
    } else {
      if (!ws.userId) {
        console.error(`Connection not registered`);
      }

      try {
        lobby.resetUser(ws.userId);
      } catch (err) {
        console.error(err);
      }
    }
  } else if (data.type === `botter`) {
    console.log(`Registered Botter #${data.id}`);

    ws.botterId = data.id;
  } else {
    if (isEmpty(data.id)) {
      console.error(`Invalid message: ${rawData}`);
      return;
    }

    if (data.bot) {
      if (data.secret !== `camera-chat-bot`) {
        console.error(`Invalid BOT secret: ${rawData}`);
        return;
      }

      const bot = new Bot(data.id, data.botterId, ws);
      lobby.addBot(bot);
    } else {
      const user = new User(data.id, ws);
      lobby.addUser(user);
    }

    ws.userId = data.id;
  }
}

function onConnection(ws, req) {
  ws.on('message', data => onMessage(ws, data));
  ws.on('error', error => onError(ws, error));
  ws.on('close', () => onClose(ws));

  console.log(`Connection Received`);
}

const lobby = new Lobby();
setInterval(lobby.update.bind(lobby), 2000);

const wss = new WebSocketServer({
  port: 8080,
});

wss.on('connection', onConnection);

console.log(`Server is running on port 8080`);
