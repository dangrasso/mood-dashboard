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

const EMOJII_TO_VALUE = {
  ':scream:':       -5,
  ':dizzy_face:':   -4,
  ':frowning2:':    -3,
  ':rolling_eyes:': -2,
  ':unamused:':     -1,
  ':neutral_face:':  0,
  ':smirk:':        +1,
  ':slight_smile:': +2,
  ':smiley:':       +3,
  ':laughing:':     +4,
  ':sunglasses:':   +5
};

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
      
      <div  class="input-area ${isAnyCellSelected() ? '' : 'm--disabled'}">
        <div class="emoji-bar">
          ${_.map(EMOJI_SET_MOODS, makeEmojiButton)}
          <span>
            ${isAnyMoodSelected() ? html`
              <span aria-label="delete" class="emoji-button" onclick=${() => deleteSelected()}>
                ${makeEmoji(':negative_squared_cross_mark:')}
              </span>
            ` : ''}
          </span>
        </div>
        ${customMoodInput(state, prev, send)}
      </div>
      
      <table>
        <tr>
          <th>
           <div class="week">
              <span onclick=${() => send('changeDaysRange', { offset: -1, unit: 'week'})}>${makeEmoji(':rewind:')}</span>
              <span onclick=${() => send('changeDaysRange', { offset: -1, unit: 'day'})}>${makeEmoji(':arrow_backward:')}</span>
              <span>week ${moment(state.days[0]).week()}</span>
              <span onclick=${() => send('changeDaysRange', { offset: +1, unit: 'day'})}>${makeEmoji(':arrow_forward:')}</span>
              <span onclick=${() => send('changeDaysRange', { offset: +1, unit: 'week'})}>${makeEmoji(':fast_forward:')}</span>
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
              let cell = { userId: user.id, day: day };
              cell.mood = getMood(cell) || null;
              const isThisSelected = isSelected(cell);
              return html`<td 
                  class="mood ${ !isAnyCellSelected() ? '' :  isThisSelected ? 'm--selected' : 'm--unselected' }"
                  onclick=${() => send('selectCell', isThisSelected ? null : cell)}>
                    ${makeEmoji(cell.mood && cell.mood.label)}
                </td>`;
            })}
          </tr>
        `)}
      </table>


      <footer>Emoji art supplied by <a href="http://emojione.com/">EmojiOne</a></footer>
    </main>
  `;

  function getMood(cell) {
    return cell.mood || _.find(state.moods, {day: cell.day, userId: cell.userId})
  }

  function isAnyCellSelected() {
    return !!state.selectedCell;
  }

  function isAnyMoodSelected() {
    return !!getSelectedMood();
  }

  function getSelectedMood() {
    return state.selectedCell && state.selectedCell.mood;
  }

  function isSelected(cell) {
    return isAnyCellSelected() &&
      state.selectedCell.userId === cell.userId &&
      state.selectedCell.day === cell.day;
  }

  function makeEmoji(emojiShortName) {
    if (!emojiShortName) return '';
    let emoji = html`<span></span>`;
    emoji.innerHTML = emojione.toImage(emojiShortName);
    return emoji;
  }

  function makeEmojiButton(emojiShortName) {
    if (!emojiShortName) return '';
    return html`
      <span role="button" class="emoji-button" 
        onclick=${() => saveSelected({ 
          label: emojiShortName, 
          value: EMOJII_TO_VALUE.hasOwnProperty(emojiShortName) 
            ? EMOJII_TO_VALUE[emojiShortName] 
            : 0
        })}>
        ${makeEmoji(emojiShortName)}
      </span>`;
  }

  function customMoodInput(state, send) {
    return html`
    <div class="input-bar">
        <span>Customize: </span>
        <label for="custom-mood-label">Label:</label>
        <input id="custom-mood-label" type="text" 
          value=${ isAnyMoodSelected() ? state.selectedCell.mood.label : ''} 
          oninput=${ _.debounce((e) => saveSelected({ label: e.target.value }), 1000) } 
         />
         <label sor="custom-mood-value">Value:</label>
         <input id="custom-mood-value" type="text" 
          value=${ isAnyMoodSelected() ? state.selectedCell.mood.value : ''} 
          oninput=${ _.debounce((e) => saveSelected({ value: e.target.value }), 1000) } 
         />
        <span>(more <a href="http://emoji.codes/" target="_blank" rel="noopener">emoji</a>)</span>   
    </div>
  `;
  }
  function saveSelected(updatedData) {
    if (!isAnyMoodSelected()) {
      return;
    }
    send('updateSelectedMood', updatedData);
    send('saveMood', state.selectedCell.mood);
  }

  function deleteSelected() {
    if (!isAnyCellSelected()) {
      return;
    }
    if (isAnyMoodSelected()) {
      send('deleteMood', state.selectedCell.mood);
    }
    send('selectCell', null);
  }

  function init() {
    send('getMoods');
    send('getUsers');
  }
};
