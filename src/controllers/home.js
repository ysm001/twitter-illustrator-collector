const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TwitterService = mongoose.model('../services/twitter.js');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  res.send('aaa');
  // Article.find(function (err, articles) {
  //   if (err) return next(err);
  //   res.render('index', {
  //     title: 'Generator-Express MVC',
  //     articles: articles
  //   });
  // });
});
