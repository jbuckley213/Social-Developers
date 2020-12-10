const express = require("express");
const User = require("../models/user.model");

const Conversation = require('../models/conversation.model')
const Message = require('../models/message.model')
const createError = require("http-errors");

const router = express.Router();



router.post("/:userId", (req,res, next)=>{
    const {userId} = req.params
    const currentUserId = req.session.currentUser._id
    console.log(currentUserId)
    Conversation.create({users: [currentUserId, userId], messages:[]})
    .then((createdConversation)=>{
        console.log(createdConversation)
        res.status(200).json(createdConversation)

    }).catch(err =>{
        next( createError(err) );

    })
})

router.get("/", (req,res, next) =>{
    const currentUserId = req.session.currentUser._id

    Conversation.find({"users":{$in:[currentUserId]}}).populate("users").populate("messages")
    .then((conversationsWithUserFound) =>{
        console.log(conversationsWithUserFound)
        res.status(200).json(conversationsWithUserFound)
    }).catch((err)=>{
        next( createError(err) );

    })

})


router.get("/:conversationId", (req, res,next)=>{
   const {conversationId} = req.params
    Conversation.findById(conversationId).populate("users").populate("messages")
    .then((conversationFound) =>{
        res.status(200).json(conversationFound)
    }).catch((err) =>{
        next( createError(err) );

    })
})


router.post('/:conversationId/message', (req, res,next)=>{
    const {conversationId} = req.params
    const currentUserId = req.session.currentUser._id
    const {messageContent} = req.body

    Message.create({userSent:currentUserId, conversation:conversationId, messageContent:messageContent})
    .then((createdMessage)=>{
        const pr =  Conversation.findByIdAndUpdate(conversationId, {$push:{messages:createdMessage._id}})
        return pr
        
    }).then((updatedConversation)=>{
        res.status(200).json(updatedConversation)
    })
    .catch(err=>{
        next( createError(err) );

    })
    

})

module.exports = router;
