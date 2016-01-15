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

// twitter.dummy().then((result) => {
//   console.log(result);
// });

twitter.getFriendIds({
  cursor: -1,
  screen_name: 'yasumo01',
  count: 5000
}).then((userIds) => {
  return twitter.getUsers({ user_id: userIds.ids });
}).then((users) => {
  TwitterUser.findAll().then((allUsers) => {
    const ids = allUsers.map((user) => {return user.id;});
    users.forEach((user) => {
      if (ids.indexOf(user.id) == -1) {
        TwitterUser.saveWithFriendIds(user);
      } else {
        console.log(`skip: ${user.screen_name} is already in DB.`);
      }
    });
  });
}).catch((error) => {
  if (error.code != 88) {
    console.log(error.stack);
    console.log(error);
  }
});
