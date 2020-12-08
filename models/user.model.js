const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require("./post.model")

const userSchema = new Schema({
  firstName: String,
  lastName:String,
  email:{ type: String, unique: true, required: true},
  image: String,
  status:String,
  password: String,
  posts: [{type: Schema.Types.ObjectId, ref:"Post"}],
  followers: [{type: Schema.Types.ObjectId, ref:"User"}],
  following: [{type: Schema.Types.ObjectId, ref:"User"}],
  likes: [{type: Schema.Types.ObjectId, ref:"Post"}],


}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const User = mongoose.model('User', userSchema);

module.exports = User;