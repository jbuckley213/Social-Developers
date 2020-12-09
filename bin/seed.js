require("dotenv").config();

const mongoose = require('mongoose');

//requiring the schema
const User = require('./../models/user.model');
const Post = require('./../models/post.model');
const saltRounds = 10;
const bcrypt = require('bcrypt');



//requiring the 'fake' objects
const users = require('./user-mock-data');
const posts = require('./post-mock-data');

const DB_NAME = "simple-steps";

// SEED SEQUENCE

// 0. ESTABLISH CONNECTION TO MONGO DATABASE
mongoose
    .connect(process.env.MONGODB_URI, {

        // .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then((x) => {
        // 1. DROP THE DATABASE
        const pr = x.connection.dropDatabase();

        return pr;
    })
    .then(() => {
        // 2.  CREATE THE DOCUMENTS FROM ARRAY OF authors
        const pr = Post.create(posts);
        return pr; // forwards the promise to next `then`
    })
    .then((createdPosts) => {
        console.log(`Created ${createdPosts.length} posts`);

        // 3. WHEN .create() OPERATION IS DONE
        // UPDATE THE OBJECTS IN THE ARRAY OF user charities
        const updatedUsers = users.map((user, i) => {
            // Update the userCharity and set the corresponding job id
            // to create the reference
            const post = createdPosts[i];
            const postId = post._id;
            user.posts = [postId];

            const salt = bcrypt.genSaltSync(saltRounds);
            user.password = bcrypt.hashSync(user.password, salt);
            return user; // return the updated userCharity
        });

        const pr = User.create(updatedUsers);
        return pr; // forwards the promise to next `then`
    })
    .then((createdUsers) => {
        console.log(`Created ${createdUsers.length} users`);

        const promiseArr = createdUsers.map((user) =>{
            const postId = String(user.posts[0]);
             const userId = user._id;
            return Post.findByIdAndUpdate(postId, { postedBy: userId }, { new: true });
        })
         const pr = Promise.all(promiseArr); //makes one big promise around all promises coming from array
         return pr
        

    })
    
    .then((updatedPosts) => {
        mongoose.connection.close();

    })

    .catch((err) => console.log(err));