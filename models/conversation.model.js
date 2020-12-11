const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user.model")
const Message = require("./conversation.model")

const conversationSchema = new Schema({
  users: [{type: Schema.Types.ObjectId, ref:"User"}],
  messages: [{type: Schema.Types.ObjectId, ref:"Message"}],
  notifications: [{type: Schema.Types.ObjectId, ref:"User"}]



}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;