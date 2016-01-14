'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class TwitterUser extends Schema {
  constructor() {
    super({
      id: String,
      screen_name: String
    });

    this.defineStaticMethods();
  }

  defineStaticMethods() {}
};

module.exports = mongoose.model('TwitterUser', new TwitterUser());
