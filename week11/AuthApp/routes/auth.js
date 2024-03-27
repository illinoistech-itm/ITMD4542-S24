var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oidc');
const FederatedCredentials = require('../models/FederatedCredentials');

async function localAuthUser(email, password, done) {
  try {
    const aUser = await User.findOne({email: email});
    if (!aUser) {
      return done(null, false);
    }
    const isMatch = await aUser.matchPassword(password);
    if (!isMatch) {
      return done(null, false);
    }
    return done(null, aUser);
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
};

async function googleAuthUser(issuer, profile, done) {
  // return done(null, profile);
  try {
    const fedCred = await FederatedCredentials.findOne({provider: issuer, subject: profile.id});
    if (!fedCred) {
      // Create new user
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
      });
      const savedNewUser = await newUser.save();
      // Create new federated credentials
      const newFedCred = new FederatedCredentials({
        provider: issuer,
        subject: profile.id,
        userid: savedNewUser.id,
      });
      const savedDoc = await newFedCred.save();
      return done(null, savedNewUser);
    } else {
      const aUser = await User.findById(fedCred.userid);
      return done(null, aUser);
    }
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
};

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, localAuthUser));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile', 'email' ],
}, googleAuthUser));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/* GET login form. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* POST local login. */
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/users',
  failureRedirect: '/login',
}));

/* POST logout. */
router.post('/logout', function(req, res, next) {
  req.logout(function(error) {
    if (error) { return next(error); }
    res.redirect('/login');
  });
});

/* GET signup form. */
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

/* POST Signup form. */
router.post('/signup', async function(req, res, next) {
  try {
    let newUser = new User({
      email: req.body.email,
      password: req.body.password,
    });
    let savedDoc = await newUser.save();
    req.login(savedDoc, function(err){
      if (err) { return next(err); }
      return res.redirect('/users');
    });
  } catch (error) {
    return next(error);
  }
});

/* GET google login. */
router.get('/login/federated/google', passport.authenticate('google'));

/* GET google redirect. */
router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/users',
  failureRedirect: '/login',
}));

module.exports = router;
