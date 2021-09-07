const {filter, find, remove} = require('lodash');
const chance = require('chance').Chance();

const Room = require('./Room');

class Lobby {
  constructor() {
    this.rooms = [];
    this.users = [];
    this.bots = [];
  }

  createRoom(user1, user2) {
    const room = new Room(user1, user2);
    this.rooms.push(room);

    return room;
  }

  addUser(user) {
    this.users.push(user);
  }

  addBot(bot) {
    this.bots.push(bot);
  }

  removeUser(userId) {
    const user = this.findUser(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    remove(this.users, (u) => u.id === userId);
    if (user.room) {
      user.room.close();
    }
  }

  removeBots(botterId) {
    for (let bot of this.bots) {
      if (bot.botterId === botterId && bot.room) {
        bot.room.close();
      }
    }

    remove(this.bots, (b) => b.botterId === botterId);
  }

  resetUser(userId) {
    const user = this.findUser(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const room = user.room;

    if (!room) {
      throw new Error(`User did not join a Room`);
    }

    room.close();
  }

  resetBot(botId) {
    const bot = this.findBot(botId);

    if (!bot) {
      throw new Error(`Bot not found: ${botId}`);
    }

    const room = bot.room;

    if (!room) {
      throw new Error(`Bot did not join a Room`);
    }

    room.close();
  }

  update() {
    console.log(`===================================================`)
    console.log(`${this.bots.length} bots`);
    console.log(`${this.users.length} total users`);
    console.log(`${this.lobbyUsersCount()} users in the lobby`);
    console.log(`${this.rooms.length} rooms`);

    for (let user of this.users) {
      try {
        if (user.room) {
          continue;
        }

        console.log(`Creating Room`);

        const user1 = user;

        const availableUsers = filter(this.users, (u) => u.id !== user.id && !u.room);
        const user2 = chance.pickone([ ...availableUsers, ...this.bots ]);

        const room = this.createRoom(user1, user2);
        console.log(`Room: ${room.id}`);
        console.log(`Users: ${user1.id} and ${user2.id}`);

        user1.room = room;
        user2.room = room;

        this.notifyUser(user1, user2.id, true);
        this.notifyUser(user2, user1.id, false);
      } catch (err) {
        console.error(err);
      }
    }
  }

  notifyUser(user, id, caller) {
    user.send({ type: 'partner', id, caller });
  }

  lobbyUsersCount() {
    return filter(this.users, (u) => u.room === null).length;
  }

  findUser(userId) {
    return find(this.users, (u) => u.id === userId);
  }

  findBot(botId) {
    return find(this.bots, (b) => b.id === botId);
  }
}

module.exports = Lobby;
