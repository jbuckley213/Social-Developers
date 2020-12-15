const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require("./post.model")
const Notification = require("./notification.model")
const Conversation = require('./conversation.model')

const userSchema = new Schema({
  firstName: String,
  lastName:String,
  email:{ type: String, unique: true, required: true},
  image: {type:String, default:'https://www.pngkey.com/png/detail/115-1150152_default-profile-picture-avatar-png-green.png'},
  status:String,
  password: String,
  posts: [{type: Schema.Types.ObjectId, ref:"Post"}],
  followers: [{type: Schema.Types.ObjectId, ref:"User"}],
  following: [{type: Schema.Types.ObjectId, ref:"User"}],
  likes: [{type: Schema.Types.ObjectId, ref:"Post"}],
  notifications: [{type: Schema.Types.ObjectId, ref:"Notification"}],
  newNotification:Boolean,
  conversations: [{type: Schema.Types.ObjectId, ref:"Conversation"}],
  darkMode: {type: Boolean, default:false}
 //lastOnline:{type:Date, default: Date.now}



}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const User = mongoose.model('User', userSchema);

module.exports = User;