var mongoose = require('mongoose')

var MoodSchema = new mongoose.Schema({
  userId: String,
  label: String,
  value: Number,
  day: { type: Date, default: Date.now }
})
module.exports = mongoose.model('Mood', MoodSchema)
