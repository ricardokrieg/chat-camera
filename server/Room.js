const chance = require('chance').Chance();

class Room {
  constructor(user1, user2) {
    this.user1 = user1;
    this.user2 = user2;

    this.id = chance.guid();
  }

  close() {
    this.user1.reset();
    this.user2.reset();

    this.id = null;
  }
}

module.exports = Room;
