const express = require('express');
const router = express.Router();
//bring in article model & user model
let Article = require('../models/article');
let User = require('../models/user');

//load add route
  router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_article', {
      title: "Add Article :"
    });
  });
//submit add route
  router.post('/add', function (req, res) {
    req.checkBody('title', 'title is required').notEmpty();
    // req.checkBody('author', 'author is required').notEmpty();
    req.checkBody('body', 'body is required').notEmpty();

    //get the errors from validation
    let errors = req.validationErrors();
    if (errors) {
      res.render('add_article', {
        title: 'Add Article :',
        errors: errors
      });
    } else {
      let article = new Article();//or add req.body and comment the below 3 statements
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(function (err) {
        if (err) {
          return console.log(err);
        }
        req.flash('success', 'article added');
        res.redirect('/');
      });
    }
  });

//load edit article form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      req.flash('danger', 'not authorized');
      res.redirect('/');
    }
    if (err) {
      return console.log(err);
    }
    res.render('edit_article', {
      title: "Edit",
      article: article
    });
  });
});
//update article route
router.post('/edit/:id', function (req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id: req.params.id};
    Article.update(query, article, function (err) {
      if (err) {
        return console.log(err);
      }
      req.flash('success', 'article updated successfully');
      res.redirect('/articles/' + req.params.id);
    });
});
//delete articles route
router.delete('/:id', function (req, res) {
  if (!req.user._id){
    res.status(500).send();
  }
  let query = {_id: req.params.id};
  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      res.send(500).send();
    } else {
      Article.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send('success');
      });
    }
  });
});

//get single article
router.get('/:id', function (req, res) {
  let query = {_id: req.params.id};
  // let id = req.params.id;
  Article.findById(query, function (err, article) {
    User.findById(article.author, function (err, user) {
      if (err) {
        return console.log(err);
      }
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

//access controll
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
  req.flash('danger', 'please login');
  res.redirect('/users/login');
  }
}

module.exports = router;
