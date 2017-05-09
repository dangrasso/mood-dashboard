const choo = require('choo');
const log = require('choo-log');
const queryString = require('query-string').parse(location.search);

const app = choo();

if ('debug' in queryString) {
  app.use(log());
}

app.model(require('./models/app'));

app.router(['/', require('./pages/home')]);

const tree = app.start();

document.body.appendChild(tree);
