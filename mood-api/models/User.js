var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  team: String,
  _id: String
})

module.exports = mongoose.model('User', UserSchema)
