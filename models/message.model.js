const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user.model")
const Conversation = require('./conversation.model')


const messageSchema = new Schema({
  userSent: {type: Schema.Types.ObjectId, ref:"User"},
  conversation: {type: Schema.Types.ObjectId, ref:"Conversation"},
  messageContent: 'String',
 



}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const Message = mongoose.model('Message', messageSchema);

module.exports = Message;