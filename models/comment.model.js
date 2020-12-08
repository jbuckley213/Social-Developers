const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user.model")
const Post = require("./post.model")


const commentSchema = new Schema({
    createdBy: {type: Schema.Types.ObjectId, ref:"User"},
    commentContent: String,
    post: {type: Schema.Types.ObjectId, ref:"Post"},
  }, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;