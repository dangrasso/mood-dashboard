var mongoose = require('mongoose')

var MoodSchema = new mongoose.Schema({
  userId: String,
  mood: String,
  day: { type: Date, default: Date.now }
})
module.exports = mongoose.model('Mood', MoodSchema)
