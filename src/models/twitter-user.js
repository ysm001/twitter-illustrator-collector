'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const twitter = require('../services/twitter.js');

class TwitterUser extends Schema {
  constructor() {
    super({
      id: String,
      name: String,
      screen_name: String,
      description: String,
      url: String,
      entities: {
        url: {
          urls: [{
            url: String,
            expanded_url: String
          }]
        },
        description: {
          urls: [{
            url: String,
            expanded_url: String
          }]
        }
      },
      friend_ids: [String],
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

  defineStaticMethods() {
    this.static('saveOrUpdate', function(params) {
      return this.findOneAndUpdate({
        id: params.id,
      }, params, {
        new: true,
        upsert: true
      }).exec();
    });

    this.static('saveWithFriendIds', function(params) {
      twitter.getFriendIds({
        cursor: -1,
        user_id: params.id,
        stringify_ids: true,
        count: 5000
      }).then((result) => {
        params.friend_ids = result.ids;
        return this.saveOrUpdate(params);
      });
    });
  }
};

module.exports = mongoose.model('TwitterUser', new TwitterUser());
