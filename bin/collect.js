'use strict';

const express = require('express');
const config = require('../config/config');
const glob = require('glob');
const mongoose = require('mongoose');

const twitter = require('../src/services/twitter.js');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/src/models/*.js');
models.forEach(function (model) {
  require(model);
});
var app = express();

require('../config/express')(app, config);

twitter.getFriendsIds({
cursor: -1,
screen_name: 'twitterapi',
count: 500
});
