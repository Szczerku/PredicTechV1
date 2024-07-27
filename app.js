const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const errorController = require('./controllers/error');
const handleWebSocket = require('./handlers/WebSocket');


const User = require('./models/user');
require('dotenv').config()

const app = express();

const store = new MongoDBStore({
    uri: process.env.MONGODB_CONNECT_URI,
    databaseName: 'PredicTech',
    collection: 'sessions'
  },
  (err) => {
    if (err) {
      console.error('Error connecting to MongoDB:', err);
    }

  });

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const sessionParser = session({
  secret: 'A80rR(WMAO@wWwh9NttfRHuB', 
  resave: false, 
  saveUninitialized: false,
  store: store
});

app.use(sessionParser);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  });



app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
});

app.use(userRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose.connect(process.env.MONGODB_CONNECT_URI, {})
  .then(() => {
    console.log('Connected to MongoDB');

    const server = app.listen(process.env.PORT || 3000, () => {
      console.log('Express server listening on port 3000');
    });
    
    handleWebSocket.handleWebSocket(server, sessionParser);

  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
