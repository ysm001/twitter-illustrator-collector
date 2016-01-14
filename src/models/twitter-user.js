'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class TwitterUser extends Schema {
  constructor() {
    super({
      id: Number,
      name: String,
      screen_name: String,
      description: String,
      url: String,
      entities: {
        url: String,
        description: String
      },
      followers_count: Number,
      friends_count: Number,
      listed_count: Number,
      created_at: Date,
      statuses_count: Number,
      lang: String,
      profile_background_image_url: String,
      profile_image_url: String,
    });

    this.defineStaticMethods();
  }

  defineStaticMethods() {}
};

module.exports = mongoose.model('TwitterUser', new TwitterUser());
