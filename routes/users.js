const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
//bring in article model
let User = require('../models/user');

//load register form
router.get('/register', function (req, res) {
  res.render('register');
});

//register process
router.post('/register', function (req, res) {
  req.checkBody('name', 'name is required').notEmpty();
  req.checkBody('email', 'email is required').notEmpty()
  req.checkBody('email', 'email is not valid').isEmail();
  req.checkBody('username', 'username is required').notEmpty();
  req.checkBody('password', 'password is required').notEmpty();
  req.checkBody('password', 'passwords does not match').equals(req.body.password2);

  let errors = req.validationErrors();
  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    let user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return console.log(err);
        }
        user.password = hash;
        user.save(function (err) {
          if (err) {
            return console.log(err);
          }
          req.flash('success', 'user created - now you can log in');
          res.redirect('/users/login');
        });
      });
    });
  }
});
//login form
router.get('/login', function (req, res) {
  res.render('login');
});
//login process
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});
//logout route
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'logged out successfully');
  res.redirect('/users/login');
});

module.exports = router;
