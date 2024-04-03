var express = require('express');
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oidc');
const FederatedCredentials = require('../models/FederatedCredentials');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtAccessSecret = "This is my JWT access secret, it should be in a .env file!";
const jwtRefreshSecret = "This is my JWT refresh secret, it should be different than the access secret and in a .env file!"

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

const jwt_opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: jwtAccessSecret
};

passport.use('jwt', new JwtStrategy(jwt_opts, async function(jwt_payload, done){
  try {
    const aUser = await User.findOne({email: jwt_payload.email});
    if (aUser) {
      return done(null, aUser);
    } else {
      return done(null, false);
    }
  } catch (error) {
    console.error(error);
    return done(error, false);
  }
}));

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

/* POST api login. */
router.post('/api/login', passport.authenticate('local', {session: false}), async function(req, res, next){
  const foundUser = await User.findOne({email: req.user.email}).exec();

  const accessToken = jwt.sign({ email: foundUser.email }, jwtAccessSecret, {expiresIn: '15m'});

  const refreshToken = jwt.sign({ email: foundUser.email }, jwtRefreshSecret, {expiresIn: '15m'});

  foundUser.refreshToken = refreshToken;
  const result = await foundUser.save();

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: 'None',
    // secure: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 Day
  });

  res.json({
    auth: true,
    accessToken,
    message: 'logged in'
  });
});

/* GET api refresh. */
router.get('/api/refresh_token', async function(req, res, next){
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401); // Unauthorized
  }
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({refreshToken}).exec();
  if (!foundUser) {
    return res.sendStatus(403); // Forbidden
  }

  jwt.verify(refreshToken, jwtRefreshSecret, function(err, decoded){
    if (err || foundUser.email !== decoded.email) {
      return res.sendStatus(403); // Forbidden
    }
    const accessToken = jwt.sign({email: foundUser.email}, jwtAccessSecret, {expiresIn: '15m'});
    res.json({
      auth: true,
      accessToken,
      message: 'access token refreshed'
    });
  });
});

/* GET api logout. */
router.get('/api/logout', async function(req, res, next){
  // Delete accessToken in client also
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); // no content
  }
  const refreshToken = cookies.jwt;
  // Is token in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      // secure: true,
    });
    return res.sendStatus(204);
  }
  foundUser.refreshToken = '';
  const result = await foundUser.save();
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    // secure: true,
  });
  res.sendStatus(204);
});


module.exports = router;
