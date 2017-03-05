const qwest = require('qwest');
const moment = require('moment');

qwest.base = 'http://localhost:3000';

const today = moment().set({'millisecond': 0, 'second': 0, 'minute': 0, 'hour': 0});

module.exports = {
  state: {
    /* initial values of state inside the model */
    team: 'teamOne',
    logs: [],
    users: [],
    days: [
      today.clone().isoWeekday(1).toISOString(), // monday...
      today.clone().isoWeekday(2).toISOString(),
      today.clone().isoWeekday(3).toISOString(),
      today.clone().isoWeekday(4).toISOString(),
      today.clone().isoWeekday(5).toISOString(), // ...to friday
    ],
    selectedUser: null,
    selectedDay: null,
  },
  reducers: {
    /* synchronous operations that modify state. Triggered by actions. Signature of (data, state). */
    sync: (state, data) => Object.assign(state, data),
    select: (state, log) => Object.assign(state, { selectedLog: log }),

    nextWeek: (state) => Object.assign(state, {
      days: state.days.map(day => moment(day).add(1, 'week').toISOString())
    }),
    previousWeek: (state) => Object.assign(state, {
      days: state.days.map(day => moment(day).subtract(1, 'week').toISOString())
    }),
  },
  effects: {
    // asynchronous operations that don't modify state directly.
    // Triggered by actions, can call actions. Signature of (data, state, send, done)
    getLogs: function (state, data, send, done) {
      qwest.get('/logs')
        .then((xhr, resp) => send('sync', {logs: resp}, done))
        .catch(console.error);
    },
    getUsers: function (state, data, send, done) {
      qwest.get('/users?team=' + state.team)
        .then((xhr, resp) => send('sync', {users: resp}, done))
        .catch(console.error);
    },
    saveLog: function(state, data, send, done) {
      const log = data;

      (log.hasOwnProperty('id') ? qwest.put(`/logs/${log.id}`, log) : qwest.post(`/logs`, log))
          .then((xhr, data) => send('getLogs', null, done))
          .catch(console.error);
    }
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
};
