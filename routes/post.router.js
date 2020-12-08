const express = require("express");
const User = require("../models/user.model");
const Post = require('../models/post.model')
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




router.get("/:id", (req, res, next)=>{
    const { id } = req.params;
    Post.findById(id).then((onePost)=>{
        res.status(201).json(onePost)
    }).catch((err)=>{
        next( createError(err) );

    })
})


router.put("/:id/likes", (req, res, next)=>{
    const { id } = req.params;
    const currentUserId = req.session.currentUser._id


    User.findById(currentUserId).then((user)=>{
        const hasAlreadyLiked = user.likes.map((postId)=>{
            if(postId === id){
                console.log("Liked already")
                return true;
            }
        })
        if(hasAlreadyLiked){
            res.status(403)
            return
        }               

    }).catch(err =>{
        next( createError(err) );

    })


    Post.findByIdAndUpdate(id, {$push:{likes:currentUserId}})
    .then((likedPost)=>{
        User.findByIdAndUpdate(currentUserId, {$push:{likes:likedPost._id}}, {new:true})
        .then((updatedUser) =>{
            res.status(200).json(updatedUser)
        }).catch((err)=>{
            next( createError(err) );

        }).catch((err) =>{
            next( createError(err) );

        })
    })
})

router.put("/:id/unlikes", (req, res, next)=>{
    const { id } = req.params;
    const currentUserId = req.session.currentUser._id




    Post.findByIdAndUpdate(id, {$pull:{likes:currentUserId}})
    .then((likedPost)=>{
        User.findByIdAndUpdate(currentUserId, {$pull:{likes:likedPost._id}}, {new:true})
        .then((updatedUser) =>{
            res.status(200).json(updatedUser)
        }).catch((err)=>{
            next( createError(err) );

        }).catch((err) =>{
            next( createError(err) );

        })
    })
})





module.exports = router;
