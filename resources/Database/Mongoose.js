const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: {
      type: String,
      required: true
    }, 
  password: {
    type: String,
    requiried: true
  }, 
    id: {
      type: String,
      required: true
}},{timestamps: true});
const Client = mongoose.model('User', UserSchema);
module.exports = Client;