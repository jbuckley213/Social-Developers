const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require("./post.model")
const User = require("./user.model")


const notificationSchema = new Schema({
  userPost: {type: Schema.Types.ObjectId, ref:"User"},
  post: {type: Schema.Types.ObjectId, ref:"Post"},
  userActivity: {type: Schema.Types.ObjectId, ref:"User"},
  notificationInfo: {type:String, enum:['liked', 'commented','follow']},



}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;