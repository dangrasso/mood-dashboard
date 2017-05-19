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
  ':sunglasses:'
];

const prefix = css`
  html, body { height:100%; }
  
  :host {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    min-height: 100%;
  
    table {
      min-width: 600px;
      background-color: white;
      padding: 1rem;
      border-collapse: collapse;
      box-sizing: border-box;
      border: 1px solid #ECF0F1;
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
      border-right: 1px solid #ECF0F1; 
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
      display: block;
      text-align: center;
      padding: 2rem;
      width: 100%;
      
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
    
    .emoji-button {      
      .emojione {
        height: 2.5rem;
        &:hover { height: 3rem; }
      }
    }
    
    footer {
      margin-top: auto;
    }
  }
`;

module.exports = function (state, prev, send) {
  return html`
    <main onload=${init} class=${prefix}>
      
      <h1>Mood Board</h1>
      <h2>Team: ${state.team}</h2>
      <div  class="input-area ${isSelectedAny() ? '' : 'm--disabled'}">
        <div class="emoji-bar">
          ${_.map(EMOJI_SET_MOODS, makeEmojiButton)}
          <span>
            ${isSelectedAny() && state.selectedLog.id ? html`
              <span aria-label="delete" class="emoji-button" onclick=${() => deleteSelected()}>
                ${makeEmoji(':negative_squared_cross_mark:')}
              </span>
            ` : ''}
          </span>
        </div>
        <div class="input-bar">
          <label for="custom-mood">Custom:</label>
          <input id="custom-mood" type="text" 
            value=${isSelectedAny() ? state.selectedLog.mood : ''} 
            oninput=${_.debounce((e) => saveSelected(e.target.value), 1000)} />
          <span>(more <a href="http://emoji.codes/" target="_blank" rel="noopener">emoji</a>)</span>   
        </div>
      </div>
      
      <table>
        <tr>
          <th>
           <div class="week">
              <span onclick=${() => send('changeDaysRange', { amount: -1, unit: 'week'})}>${makeEmoji(':rewind:')}</span>
              <span onclick=${() => send('changeDaysRange', { amount: -1, unit: 'day'})}>${makeEmoji(':arrow_backward:')}</span>
              <span>week ${moment(state.days[0]).week()}</span>
              <span onclick=${() => send('changeDaysRange', { amount: +1, unit: 'day'})}>${makeEmoji(':arrow_forward:')}</span>
              <span onclick=${() => send('changeDaysRange', { amount: +1, unit: 'week'})}>${makeEmoji(':fast_forward:')}</span>
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
              
              return html`<td 
                  class="mood ${isSelected(user, day) ? 'm--selected' : isSelectedAny() ? 'm--unselected' : '' }"
                  onclick=${() => send('select', isSelected(user, day) ? null : log)}>
                    ${makeEmoji(log.mood)}
                </td>`;
            })}
          </tr>
        `)}
      </table>

      

      <footer>Emoji art supplied by <a href="http://emojione.com/">EmojiOne</a></footer>
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

  function makeEmojiButton(emojiShortName) {
    return html`
      <span class="emoji-button" onclick=${() => saveSelected(emojiShortName)}>
        ${makeEmoji(emojiShortName)}
      </span>`;
  }

  function makeEmoji(emojiShortName) {
    let emoji = html`<span></span>`;
    emoji.innerHTML = emojione.toImage(emojiShortName);
    return emoji;
  }

  function saveSelected(mood) {
    if (!isSelectedAny()) {
      return;
    }
    const log = state.selectedLog;
    log.mood = mood;
    send('saveLog', log);
  }

  function deleteSelected() {
    if (!isSelectedAny()) {
      return;
    }
    const log = state.selectedLog;
    send('deleteLog', log);
  }

  function init() {
    send('getLogs');
    send('getUsers');
  }
};
