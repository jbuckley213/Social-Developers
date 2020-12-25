const express = require("express");
const User = require("../models/user.model");
const Post = require('../models/post.model');
const Notification = require("../models/notification.model")

const Comment = require('../models/comment.model')
const createError = require("http-errors");
const uploader = require("./../config/cloundinary-setup");

const router = express.Router();


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
  

router.post("/", (req, res, next)=>{
    const {postedBy, postContent, postPhoto, code} = req.body;
    let newPost;
    Post.create({postedBy, postContent,postPhoto,code, likes:[], comments:[]})
    .then((createdPost)=>{
        newPost=createdPost
        const pr = User.findByIdAndUpdate(postedBy, {$push:{posts:createdPost._id}}, {new:true})
        return pr
    }).then((updatedUser)=>{
        newPost.postedBy = updatedUser
        res.status(201).json(newPost)
    }).catch((err)=>{
        next( createError(err) );
    })
    .catch((err)=>{
        next( createError(err) );
    })

})

router.get("/", (req, res, next)=>{
    const currentUserId = req.session.currentUser._id

    const populateQuery = {
        path: 'posts',
        model: 'Post',
        populate: [{
            path: 'postedBy',
            model: 'User'
        },{
            path: 'comments',
            model: 'Comment',
            populate: {
                path:'createdBy', 
                model:"User"
            }
        }]
    }
   

    User.find({"followers":{$in:[currentUserId]}}).populate(populateQuery)
    .then((foundUsers)=>{
        res.status(201).json(foundUsers)
    }).catch((err)=>{
        res.status(500).json(err)

    })
})


// Get all posted by users who have followed
// router.get("/", (req, res, next)=>{
//     const currentUserId = req.session.currentUser._id
   

//     User.findById(currentUserId)
//     .then((currentUser)=>{
//         const following = currentUser.following

//        const pr =  following.map((oneUserFollow)=>{
//           return Post.find({postedBy:oneUserFollow}).populate("posts")
//        })
//        const allPromises = Promise.all(pr)
//        return allPromises;
//     }).then((posts)=>{
//         res.status(200).json(posts)
//     })
//     .catch((err)=>{
//         next( createError(err) );

//     })
// })




router.get("/:postId", (req, res, next)=>{
    

    const populateQuery = {
        path: 'comments',
        model: 'Comment',
        populate: {
            path: 'createdBy',
            model: 'User'
        }
    }

    const { postId } = req.params;
    Post.findById(postId).populate("postedBy").populate("likes").populate(populateQuery)
    .then((onePost)=>{
        res.status(201).json(onePost)
    }).catch((err)=>{
        next( createError(err) );

    })
})


router.delete("/:postId/delete", (req, res, next)=>{
    const { postId } = req.params;
    const currentUserId = req.session.currentUser._id;


    Post.findById(postId)
    .then((foundPost)=>{
        if(foundPost.postedBy.toString() !== currentUserId){
            return next( createError(400) )
            
        }
        else{

            Post.findByIdAndRemove(postId)
            .then((deletedPost)=>{
                const pr = User.findByIdAndUpdate(currentUserId, {$pull:{posts:deletedPost._id}}, {new:true})
                return pr
            })
            .then((updatedUser)=>{
                const pr = User.updateMany({"likes":{$in:[postId]}}, {$pull:{likes:postId}}, {new:true})
                return pr
                

            })
            .then((updatedUsers)=>{
                res.status(201).json(updatedUsers)
            })
            .catch((err)=>{
                next( createError(err) );
        
            })
            .catch((err)=>{
                next( createError(err) );
        
            })
    }
    }).catch((err) => {
        next( createError(err) );

    })


    
})


router.put("/:postId/likes", (req, res, next)=>{
    const { postId } = req.params;
    const currentUserId = req.session.currentUser._id
    

    User.findById(currentUserId).then((user)=>{
        let hasAlreadyLiked =false;
        user.likes.forEach((postLiked)=>{
            if(postId === postLiked.toString()){
                hasAlreadyLiked = true
            }
        })
        if(hasAlreadyLiked){
            return next( createError(400) );
        } else{

                Post.findByIdAndUpdate(postId, {$push:{likes:currentUserId}})
                .then((likedPost)=>{

                    if(likedPost.postedBy.toString() === currentUserId){

                        User.findByIdAndUpdate(currentUserId, {$push:{likes:postId}}, {new:true}).then(()=>{
                            res.status(200).json(likedPost)
                            return;

                        }).catch(err=>{
                            next( createError(err) );
                        })
                    }
                    else{   //create Notification
                        Notification.create({userPost:likedPost.postedBy, post:likedPost._id, userActivity: currentUserId, notificationInfo:"liked"})

                        .then((notificationCreated) =>{
                
                            if(notificationCreated.userPost.toString() === currentUserId){
                                return;
                            }
                            else{
                            const pr = User.findByIdAndUpdate(notificationCreated.userPost, {$push: {notifications:notificationCreated._id}, newNotification:true})
                            return pr}
                    })
                    .then((updatedUser)=>{
                                const pr = User.findByIdAndUpdate(currentUserId, {$push:{likes:postId}}, {new:true})
                                return pr
                    }).then((updatedCurrentUser)=>{
                        res.status(200).json(updatedCurrentUser)
                    }).catch(err=>{
                        next( createError(err) );
                    }) 
                    }
                    
                })
                
                
                .catch((err) =>{
                    next( createError(err) );
            
                })

        
     
        }}).catch(err =>{
        next( createError(err) );

    })
})


router.put("/:postId/unlikes", (req, res, next)=>{
    const { postId } = req.params;
    const currentUserId = req.session.currentUser._id




    Post.findByIdAndUpdate(postId, {$pull:{likes:currentUserId}})
    .then((likedPost)=>{
        User.findByIdAndUpdate(currentUserId, {$pull:{likes:likedPost._id}}, {new:true})
        .then((updatedUser) =>{
            res.status(200).json(updatedUser)
        }).catch((err)=>{
            next( createError(err) );

        })
    }).catch((err) =>{
        next( createError(err) );

    })
})


router.post("/:postId/comment", (req, res, next)=>{
    const { postId } = req.params;
    const currentUserId = req.session.currentUser._id
    const { commentContent } = req.body;

    let comment;

    Comment.create({createdBy:currentUserId, commentContent, post:postId})
    .then((createComment => {
        comment = createComment
        comment.createdBy = req.session.currentUser
        
        Post.findByIdAndUpdate(postId,{$push:{comments:createComment._id}}, {new:true} ).populate("comments")
        .then((updatedPost)=>{

            if(updatedPost.postedBy.toString() === currentUserId){
                res.status(200).json(comment)

                return;
            }else{
                Notification.create({userPost:updatedPost.postedBy, post:updatedPost._id, userActivity: currentUserId, notificationInfo:"commented"})


                .then((notificationCreated)=>{

                    if(notificationCreated.userPost.toString() === currentUserId){
                        return;
                    }else{
                        const pr = User.findByIdAndUpdate(notificationCreated.userPost, {$push: {notifications:notificationCreated._id}, newNotification:true})
                        return pr
                    }
                    
        
                }).then((updatedUser)=>{
                    res.status(200).json(comment)
                })
                .catch(err =>{
                    next( createError(err) );
        
                })
            }


         })
    })).catch(err =>{
        next( createError(err) );

    })
  


})


router.delete("/:postId/comment/:commentId", (req, res, next)=>{
    const { postId, commentId } = req.params;
    
    const currentUserId = req.session.currentUser._id
    
    Comment.findById(commentId).then((commentFound)=>{
        const commentOwnerId = commentFound.createdBy.toString()
        if(commentOwnerId !== currentUserId){
            res.status(403).json()
            return
        }
        else{
            Comment.findByIdAndRemove(commentId)
            .then((deleteComment)=>{
               const pr = Post.findByIdAndUpdate(postId, {$pull:{comments:commentId}})
               return pr;
            }).then((updatedPost)=>{
                res.status(200).json(updatedPost)
            }).catch(err=>{
                next( createError(err) );
        
            })

        }
    })


   
})


module.exports = router;
