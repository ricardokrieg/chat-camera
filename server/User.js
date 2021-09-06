class User {
  constructor(id, connection) {
    this.id = id;
    this.connection = connection;

    this.reset();
  }

  reset() {
    this.room = null;

    this.send({ type: `reset` });
  }

  send(data) {
    this.connection.send(JSON.stringify(data));
  }
}

module.exports = User;
