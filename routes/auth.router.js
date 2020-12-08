const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/user.model");

// HELPER FUNCTIONS
const {
  isLoggedIn,
  isNotLoggedIn,
  validationLogin
} = require("../helpers/middlewares");

// POST '/auth/signup'
router.post('/signup', isNotLoggedIn, validationLogin, (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  User.findOne({ email })
    .then( (foundUser) => {

      if (foundUser) {
        // If username is already taken, then return error response
        return next( createError(400) ); // Bad Request
      }
      else {
        // If username is available, go and create a new user
        const salt = bcrypt.genSaltSync(saltRounds);
        const encryptedPassword = bcrypt.hashSync(password, salt);

        User.create( { firstName, lastName, email, password: encryptedPassword })
          .then( (createdUser) => {
            // set the `req.session.currentUser` using newly created user object, to trigger creation of the session and cookie
            createdUser.password = "*";
            req.session.currentUser = createdUser; // automatically logs in the user by setting the session/cookie

            res
              .status(201) // Created
              .json(createdUser); // res.send()

          })
          .catch( (err) => {
            next( createError(err) );  //  new Error( { message: err, statusCode: 500 } ) // Internal Server Error
          });
      }
    })
    .catch( (err) => {
      next( createError(err) );
    });


})




// POST '/auth/login'
router.post('/login', isNotLoggedIn, validationLogin, (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then( (user) => {
      if (! user) {
        // If user with that username can't be found, respond with an error
        return next( createError(404)  );  // Not Found
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password); //  true/false

      if (passwordIsValid) {
        // set the `req.session.currentUser`, to trigger creation of the session
        user.password = "*";
        req.session.currentUser = user;

        res
          .status(200)
          .json(user);

      }
      else {
        next( createError(401) ); // Unathorized
      }

    })
    .catch( (err) => {
      next( createError(err)  );
    });
})


// GET '/auth/logout'
router.get('/logout',  isLoggedIn, (req, res, next) => {
  req.session.destroy( function(err){
    if (err) {
      return next(err);
    }

    res
      .status(204)  //  No Content
      .send();
  } )
})



// GET '/auth/me'
router.get('/me', isLoggedIn, (req, res, next) => {
  const currentUserSessionData = req.session.currentUser;

  res
    .status(200)
    .json(currentUserSessionData);

})


module.exports = router;
