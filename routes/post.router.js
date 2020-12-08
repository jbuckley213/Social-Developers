const express = require("express");
const User = require("../models/user.model");
const Post = require('../models/post.model');
const Comment = require('../models/comment.model')
const createError = require("http-errors");

const router = express.Router();


router.post("/", (req, res, next)=>{
    const {postedBy, postContent} = req.body;

    Post.create({postedBy, postContent, likes:[], comments:[]})
    .then((createdPost)=>{
        const pr = User.findByIdAndUpdate(postedBy, {$push:{posts:createdPost._id}}, {new:true})
        return pr
    }).then((updatedUser)=>{
        res.status(201).json(updatedUser)
    }).catch((err)=>{
        next( createError(err) );
    })
    .catch((err)=>{
        next( createError(err) );
    })

})

// router.get("/", (req, res, next)=>{
//     const { id } = req.params;
//     const currentUserId = req.session.currentUser._id
   

//     User.find({"followers":{$in:[currentUserId]}}).populate("posts")
//     .then((foundUsers)=>{
//         res.status(201).json(foundUsers)
//     }).catch((err)=>{
//         res.status(500).json(err)

//     })
// })

router.get("/", (req, res, next)=>{
    const currentUserId = req.session.currentUser._id
   

    User.findById(currentUserId)
    .then((currentUser)=>{
        const following = currentUser.following

       const pr =  following.map((oneUserFollow)=>{
          return Post.find({postedBy:oneUserFollow}).populate("posts")
       })
       const allPromises = Promise.all(pr)
       return allPromises;
    }).then((posts)=>{
        res.status(200).json(posts)
    })
    .catch((err)=>{
        next( createError(err) );

    })
})




router.get("/:postId", (req, res, next)=>{
    const { postId } = req.params;
    Post.findById(postId).then((onePost)=>{
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
            console.log("Posted by", typeof foundPost.postedBy, typeof currentUserId )
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
                

            }).then((updatedUsers)=>{
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
            console.log(typeof postId, typeof postLiked)
            if(postId === postLiked.toString()){
                console.log("Liked already")
                hasAlreadyLiked = true
            }
        })
        if(hasAlreadyLiked){
            console.log("hasAlreadyLiked", hasAlreadyLiked)
            return next( createError(400) );
        } else{

            Post.findByIdAndUpdate(postId, {$push:{likes:currentUserId}})
            .then((likedPost)=>{
                User.findByIdAndUpdate(currentUserId, {$push:{likes:likedPost._id}}, {new:true})
                .then((updatedUser) =>{
                    res.status(200).json(updatedUser)
                }).catch((err)=>{
                    next( createError(err) );
        
                })
            }).catch((err) =>{
                next( createError(err) );
        
            })


            
        }              

    }).catch(err =>{
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

    Comment.create({createdBy:currentUserId, commentContent, post:postId})
    .then((createComment => {
        Post.findByIdAndUpdate(postId,{$push:{comments:createComment._id}}, {new:true} ).populate("comments")
        .then((updatedPost)=>{
            res.status(200).json(updatedPost)

        }).catch(err =>{
            next( createError(err) );

        })
    })).catch(err =>{
        next( createError(err) );

    })
  


})




module.exports = router;
