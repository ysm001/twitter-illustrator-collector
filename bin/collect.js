'use strict';

const express = require('express');
const config = require('../config/config');
const glob = require('glob');
const mongoose = require('mongoose');

const twitter = require('../src/services/twitter.js');
const TwitterUser = require('../src/models/twitter-user.js');

mongoose.connect(config.db);
const db = mongoose.connection;
db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});

const models = glob.sync(config.root + "/src/models/*.js");

models.forEach((model) => {
  require(model);
});
const app = express();

require('../config/express')(app, config);

twitter.getFriendsIds({
  cursor: -1,
  screen_name: 'yasumo01',
  count: 10
}).then((userIds) => {
  return twitter.getUsers({
    user_id: userIds.ids
  });
}).then((users) => {
  users.forEach((user) => {
    TwitterUser.saveOrUpdate(user);
  });
}).catch((error, something) => {
  console.log(error);
  console.log(something);
});
