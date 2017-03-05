const html = require('choo/html');
const css = require('sheetify');
const _ = require('lodash');
const moment = require('moment');
const emojione = require('emojione');

const EMOJI_SET_MOODS = [
  ':scream:',
  ':dizzy_face:',
  ':frowning2:',
  ':rolling_eyes:',
  ':unamused:',
  ':neutral_face:',
  ':smirk:',
  ':slight_smile:',
  ':smiley:',
  ':laughing:',
  ':sunglasses:',
];

const EMOJI_SET_SPECIAL = [
  ':thermometer_face:',
  ':poop:',
];

const EMOJI_SET_ANIMALS = [
  ':blowfish:',
  ':octopus:',
  ':ant:',
  ':monkey:',
  ':gorilla:',
  ':bear:',
  ':turtle:',
  ':snail:',
  ':racehorse:',
  ':unicorn:',

];

const prefix = css`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  
    table {
      background-color: white;
      padding: 1rem;
      border-collapse: collapse;
      box-sizing: border-box;
    }
    
    tr { border-top: 1px solid #ECF0F1; }
    
    td {
      &.m--selected { border: 3px solid #FFC300; }
      &.m--unselected { opacity: .3 }
    }
    
    .th {
      max-width: 8rem
    }

    .week {
      display: flex;
      justify-content: space-around;
      align-items: center;      
      .emojione{ height: 1.5rem;}
    }
    
    .user { 
      background-color: #ECF0F1; 
    }
    
    .day {
      text-align: center;
      color: gray;
    }
    
    .mood { 
      text-align: center; 
      width: 5rem;
      height: 5rem;
    }
    
    .input-area {
      &.m--disabled { 
        opacity: .5 ;
        .emoji-button .emojione:hover { height: 2.5rem; }
      }
    }
    
    .emoji-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 5rem;
    }
    
    .emoji-button .emojione{
      height: 2.5rem;
      &:hover { height: 3rem; }
    }
  
  }
`;

module.exports = function (state, prev, send) {
  return html`
    <main onload=${init} class=${prefix}>
      
      <h1>Mood Board</h1>
      <h2>Team: ${state.team}</h2>

      <table>
        <tr>
          <th>
           <div class="week">
              ${ (() => {
                const emojiBtn = html`<span onclick=${() => send('previousWeek')}></span>`;
                emojiBtn.innerHTML = emojione.toImage(':arrow_backward:');
                return emojiBtn;
              })()}
              
              <span>week ${moment(state.days[0]).week()}</span>
              
              ${ (() => {
                const emojiBtn2 = html`<span onclick=${() => send('nextWeek')}></span>`;
                emojiBtn2.innerHTML = emojione.toImage(':arrow_forward:');
                return emojiBtn2;
              })()}
            </div>
          </th>
          ${_.map(state.days, day => {
            const momentDay = moment(day);
            return html`
              <th class="day">
                <div>${momentDay.format('DD.M')}</div>
                <div>${momentDay.format('ddd')}</div>
              </th>`;
          })}
        </tr>

        ${_.map(state.users, user => html`
          <tr>
            <th class="user">${user.id}</th>
            ${_.map(state.days, day => {
              const log = getLog(user, day) || 
                {
                  day: day,
                  userId: user.id, 
                  mood: ''
                };
              
              let cell;
              
              if (!isSelectedAny()) {
                cell = html`<td class="mood" onclick=${() => send('select', log)}></td>`;
              } else if (isSelected(user, day)) {
                cell = html`<td class="mood m--selected" onclick=${() => send('select', undefined)}></td>`;
              } else {
                cell = html`<td class="mood m--unselected" onclick=${() => send('select', log)}></td>`;
              }
              
              cell.innerHTML = emojione.toImage(log.mood);
    
              return cell;
            })}
          </tr>
        `)}
      </table>

      <div  class="input-area ${isSelectedAny() ? '' : 'm--disabled'}" enabled="false">
        <div class="emoji-bar">
          Moods: ${_.map(EMOJI_SET_MOODS, makeEmojiButton)}
        </div>
        <div class="emoji-bar">
          Animals: ${_.map(EMOJI_SET_ANIMALS, makeEmojiButton)}
        </div>
        <div class="emoji-bar">
          Special: ${_.map(EMOJI_SET_SPECIAL, makeEmojiButton)}
        </div>
        <div class="emoji-bar">
          <button type="button" onclick=${() => save('')}>reset</button>
        </div>
        <div class="emoji-bar">
          Custom: <input type="text" value=${isSelectedAny() ? state.selectedLog.mood : ''} oninput=${(e) => save(e.target.value)}>
        </div>
      </div>
      }

    </main>
  `;

  function getLog(user, day) {
    return _.find(state.logs, {day: day, userId: user.id});
  }

  function isSelected(user, day) {
    return isSelectedAny() && state.selectedLog.userId === user.id && state.selectedLog.day === day;
  }

  function isSelectedAny() {
    return !!state.selectedLog;
  }

  function makeEmojiButton(emoji) {
    let emojiBtn = html`<span class="emoji-button" onclick=${() => save(emoji)}></span>`;
    emojiBtn.innerHTML = emojione.toImage(emoji);
    return emojiBtn;
  }

  function save(mood) {
    if (!isSelectedAny()) {
      return;
    }
    const log = state.selectedLog;
    log.mood = mood;
    send('saveLog', log);
  }

  function init() {
    send('getLogs');
    send('getUsers');
  }
};
