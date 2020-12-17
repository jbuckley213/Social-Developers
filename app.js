const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const postRouter = require('./routes/post.router');
const conversationRouter = require('./routes/conversation.router')


// MONGOOSE CONNECTION
mongoose
  .connect(process.env.MONGODB_URI, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:true,
  })
  .then(() => console.log(`Connected to database`))
  .catch((err) => console.error(err));


// EXPRESS SERVER INSTANCE
const app = express();

// CORS MIDDLEWARE SETUP
app.use(
  cors({
    credentials: true,
    origin: [process.env.PUBLIC_DOMAIN,
      "https://social-developer-platform.herokuapp.com",
      "http://social-developer-platform.herokuapp.com"],
  }),
);


// SESSION MIDDLEWARE
app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 30 * 24 * 60 * 60, // 30 days
    }),
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
);

// MIDDLEWARE
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTER MIDDLEWARE
app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use("/api/posts", postRouter)
app.use('/api/conversations', conversationRouter)


// ROUTE FOR SERVING REACT APP (index.html)
app.use((req, res, next) => {
  // If no previous routes match the request, send back the React app.
  res.sendFile(__dirname + "/public/index.html");
});


// ERROR HANDLING
//  Catch 404 and respond with error message
// Shows a 404 error with a message when no route is found for the request
app.use((req, res, next) => {
  res
    .status(404)
    .json({ code: 'not found' });    // .send( JSON.stringify(  { code: 'not found' }  ) )

});



// Catch `next(err)` calls
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    const statusError = err.status || '500';
    res.status(statusError).json(err);
  }
});


module.exports = app;
