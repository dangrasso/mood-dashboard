var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  userId: String,
  id: Number,
  mood: String,
  day: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Log', LogSchema);
