const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user.model")
const Comment = require("./comment.model")


const postSchema = new Schema({
    postedBy: {type: Schema.Types.ObjectId, ref:"User"},
    postContent: String,
    postPhoto: String,  
    likes: [{type: Schema.Types.ObjectId, ref:"User"}],
    comments: [{type: Schema.Types.ObjectId, ref:"Comment"}],
    date:{type: Date, default: Date.now}, 
    code: String,
   
  }, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const Post = mongoose.model('Post', postSchema);

module.exports = Post;