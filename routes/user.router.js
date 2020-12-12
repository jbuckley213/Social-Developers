const express = require("express");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

const router = express.Router();
const createError = require("http-errors");
const uploader = require("./../config/cloundinary-setup");


const {isAdmin} = require("../helpers/middlewares");

router.get('/', (req, res, next)=>{
    User.find().populate("posts")
    .then((users)=>{
        res.status(200).json(users)
    }).catch(err => {
        next( createError(err) );
    })
})

router.get('/:id', isAdmin, (req, res, next)=>{


    const postPopulateQuery = {
        path: 'posts',
        model: 'Post',
        populate: {
            path: 'postedBy',
            model: 'User'
        }
    }
    const likesPopulateQuery = {
        path: 'likes',
        model: 'Post',
        populate: {
            path: 'postedBy',
            model: 'User'
        }
    }

    const notificationPopulateQuery = {
        path: 'notifications',
        model: 'Notification',
        populate: {
            path: 'userActivity',
            model: 'User'
        }
    }

   

    const { id } = req.params
    const isAdmin = req.isAdmin
    User.findById(id).populate(postPopulateQuery).populate(likesPopulateQuery).populate("following").populate(notificationPopulateQuery)
    .then((user)=>{
        res.status(200).json({user, isAdmin})
    }).catch(err => {
        next( createError(err) );
    })
})

router.put('/:id/follow', (req, res, next)=>{

    const { id } = req.params
    const currentUserId = req.session.currentUser._id


    User.findByIdAndUpdate(id, {$push:{followers:currentUserId}}, {new:true}).populate("posts").populate('users')
    .then((updatedUser)=>{

        User.findByIdAndUpdate(currentUserId, {$push:{following:updatedUser._id}}, {new:true})
        .then((updatedCurrentUser)=>{
            res.status(200).json(updatedCurrentUser)


    }).catch(err =>{
        next( createError(err) );

    })
   
}).catch(err => {
    next( createError(err) );
})

})


router.put('/:id/unfollow', (req, res, next)=>{

    const { id } = req.params
    const currentUserId = req.session.currentUser._id


    User.findByIdAndUpdate(id, {$pull:{followers:currentUserId}}, {new:true}).populate("posts").populate('users')
    .then((updatedUser)=>{
       

        User.findByIdAndUpdate(currentUserId, {$pull:{following:updatedUser._id}}, {new:true})
        .then((updatedCurrentUser)=>{
            res.status(200).json(updatedCurrentUser)


    }).catch(err =>{
        next( createError(err) );

    })
   
}).catch(err => {
    next( createError(err) );
})

})

router.post("/upload", uploader.single("image"), (req, res, next) => {
    console.log("file is: ", req.file);
  
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    // get secure_url from the file object and save it in the
    // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
    res.json({ secure_url: req.file.secure_url });
  });

router.post('/edit', (req, res, next)=>{
    const {image} = req.body;
    const currentUserId = req.session.currentUser._id
    console.log(image)

    User.findByIdAndUpdate(currentUserId, {image:image})
    .then((userUpdated)=>{
        res.status(200).json(userUpdated)
    }).catch(err =>{
        next( createError(err) );

    })    


})


router.put('/notifications/:notificationId', (req, res, next) =>{
    const { notificationId } = req.params

    const currentUserId = req.session.currentUser._id

    User.findByIdAndUpdate(currentUserId, {$pull:{notifications: notificationId}})
    .then(()=>{
        const pr = Notification.findByIdAndDelete(notificationId)
        return pr
    }).then((deletedNotification)=>{
        res.status(200).json(deletedNotification)

    }).catch((err)=>{
        next( createError(err) );
    })

})

router.get('/notifications/seen', (req, res, next)=>{
    const currentUserId = req.session.currentUser._id

    User.findByIdAndUpdate(currentUserId, {newNotification:false})
    .then((userUpdated)=>{
        res.status(200).json(userUpdated)
    }).catch(err =>{
        next( createError(err) );

    })
})

router.post("/dark-mode", (req, res, next) =>{
    const currentUserId = req.session.currentUser._id
    const {darkMode} = req.body 
    let mode;
    if(darkMode === 'light'){
        mode = false
    }else if(darkMode === 'dark'){
        mode = true
    }

    User.findByIdAndUpdate(currentUserId, {darkMode:mode})
    .then((updatedUser)=>{
        res.status(200).json(updatedUser)
    }).catch((err)=>{
        next( createError(err) );

    })
})  

module.exports = router;
