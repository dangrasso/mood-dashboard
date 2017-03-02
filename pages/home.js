const html = require('choo/html')
const _ = require('lodash');

module.exports = function (state, prev, send) {
  return html`
    <main onload=${init}>
      <style>
        table, tr, td, th {
          border: 0;
        }
        td {
          height: 3rem;
          min-width: 3rem;
        }

        .day {
          text-align: center;
          color: gray;
        }
        .user {
          background-color: lightgray;
        }
        .mood {
          text-align: center;
        }
      </style>

      <h1>Mood Board</h1>
      <h2>Team: ${state.team}</h2>

      <table>
        <tr>
          <th></th>
          ${_.map(state.days, day => html`<th class="day">${day}</th>`)}
        </tr>
        ${_.map(state.users, user => html`
          <tr>
            <th class="user">${user.id}</th>
            ${_.map(state.days, day => html`
              <td class="mood">${getMood(user,day)}</td>
            `)}
          </tr>
        `)}
      </table>
    </main>
  `;

  function getMood(user, day) {
    var log = _.find(state.logs, {day: day, userId: user.id});
    return log ? log.moodLabel : '';
  }

  function init (e) {
    send('getLogs');
    send('getUsers');
  }
}
