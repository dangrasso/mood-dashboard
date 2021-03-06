const qwest = require('qwest');
const moment = require('moment');
const qsUtil = require('query-string');
const queryString = qsUtil.parse(location.search);

qwest.base = 'http://localhost:3000';

const today = moment.utc().set({'millisecond': 0, 'second': 0, 'minute': 0, 'hour': 0});

module.exports = {
  state: {
    /* initial values of state inside the model */
    team: queryString.team,
    moods: [],
    users: [],
    days: [ // two weeks, monday to friday
      today.clone().isoWeekday(1).toISOString(),
      today.clone().isoWeekday(2).toISOString(),
      today.clone().isoWeekday(3).toISOString(),
      today.clone().isoWeekday(4).toISOString(),
      today.clone().isoWeekday(5).toISOString(),

      today.clone().isoWeekday(1 + 7).toISOString(),
      today.clone().isoWeekday(2 + 7).toISOString(),
      today.clone().isoWeekday(3 + 7).toISOString(),
      today.clone().isoWeekday(4 + 7).toISOString(),
      today.clone().isoWeekday(5 + 7).toISOString(),
    ],
    selectedMood: null,
  },
  reducers: {
    /* synchronous operations that modify state. Triggered by actions. Signature of (data, state). */
    sync: (state, data) => Object.assign(state, data),
    select: (state, mood) => ({ selectedMood: mood }),
    changeDaysRange: (state, data) => ({
      days: state.days.map(day => {
        let newDay = moment(day).add(data.amount, data.unit);

        // skip weekends
        const isGoingForward = data.amount >= 0;
        if (newDay.isoWeekday() === 6) {
          newDay = isGoingForward ? newDay.add(2, 'days') : newDay.subtract(1, 'days');
        } else if (newDay.isoWeekday() === 7) {
          newDay = isGoingForward ? newDay.add(1, 'days') : newDay.subtract(2, 'days');
        }
        return newDay.toISOString();
      })
    }),
  },
  effects: {
    // asynchronous operations that don't modify state directly.
    // Triggered by actions, can call actions. Signature of (data, state, send, done)
    getMoods: function (state, data, send, done) {
      qwest.get('/moods')
        .then((xhr, resp) => send('sync', {moods: resp}, done))
        .catch(console.error);
    },
    getUsers: function (state, data, send, done) {
      qwest.get(`/users/${state.team ? `team/${state.team}` : ''}`)
        .then((xhr, resp) => send('sync', {users: resp}, done))
        .catch(console.error);
    },
    saveMood: function(state, mood, send, done) {
      (mood.hasOwnProperty('_id') ? qwest.put(`/moods/${mood._id}`, mood) : qwest.post(`/moods`, mood))
          .then((xhr, savedMood) => send('select', savedMood, done))
          .then(() => send('getMoods', null, done))
          .catch(console.error);
    },
    deleteMood: function(state, mood, send, done) {
      qwest['delete'](`/moods/${mood._id}`)
        .then(() => send('select', null, done))
        .then(() => send('getMoods', null, done))
        .catch(console.error);
    }
  }
};
