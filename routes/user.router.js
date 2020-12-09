const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const createError = require("http-errors");

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

    const { id } = req.params
    const isAdmin = req.isAdmin
    User.findById(id).populate("posts").populate("likes").populate("following")
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

module.exports = router;
