const express = require('express')
const cookieSession = require('cookie-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const key = require('./keys')

const app = express()
const port = 3000
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieSession({
  name: 'session',
  secret: 'my-secret-1234',
  resave: false,
  saveUninitialized: true,
  cookie:{
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}))

app.set('view engine', 'hbs')

passport.serializeUser(function(user, done) {
  done(null, user)
})
passport.deserializeUser(function(user, done) {
  done(null, user)
})

passport.use(new GoogleStrategy({
  clientID:  key.clientID,
  clientSecret: key.clientSecret,
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
function(req, accessToken, refreshToken, profile, done) {
    return done(null, profile)
}))

app.get('/auth/google',
  passport.authenticate('google', { successRedirect: '/',scope:
    [ 'https://www.googleapis.com/auth/userinfo.email' ] }))

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
      successRedirect: '/',
      failureRedirect: '/auth/google', }))

app.get('/article',function (req, res, next) {
  if (req.session.passport) {
    return res.render('articles')
    next()
  }
  res.redirect('auth/google')
})

app.get('/logout', function (req, res) {
  req.session = null
  res.redirect('/')
})

app.get('/', function (req, res, next) {
  if (req.session.passport) {
    return res.render('index', {
    name: req.session.passport.user.displayName
    })
    next()
  }
  res.render('index')
})

app.listen(port, function () {
  console.log('Server listening port ' + port)
})
