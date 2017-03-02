const qwest = require('qwest');

const BASE_URL = 'http://localhost:3000';

module.exports = {
  state: {
    /* initial values of state inside the model */
    team: 'privacy',
    logs: [],
    users: [],
    days: [
      '2017-02-27',
      '2017-02-28',
      '2017-03-01',
      '2017-03-02',
      '2017-03-03',
    ],
  },
  reducers: {
    /* synchronous operations that modify state. Triggered by actions. Signature of (data, state). */
    sync: function (state, data) {
      console.log(data);

      return Object.assign(state, data);
    }
  },
  effects: {
    // asynchronous operations that don't modify state directly.
    // Triggered by actions, can call actions. Signature of (data, state, send, done)
    getLogs: function (state, data, send, done) {
      qwest.get(BASE_URL + '/logs')
        .then((xhr, data) => send('sync', {logs: data}, done))
        .catch(console.error);
    },
    getUsers: function (state, data, send, done) {
      qwest.get(BASE_URL + '/users?team=' + state.team)
        .then((xhr, data) => send('sync', {users: data}, done))
        .catch(console.error);
    },
  },
  subscriptions: {
    // asynchronous read-only operations that don't modify state directly.
    // Can call actions. Signature of (send, done).
    /*
    checkStuff: function (send, done) {
      setInterval(function () {
        send('update', data, function (err) {
          if (err) return done(err)
        })
      }, 1000)
    }
    */
  }
}
