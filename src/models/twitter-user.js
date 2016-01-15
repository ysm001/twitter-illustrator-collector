'use strict';

require('../../lib/array-ext.js');
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
      pixiv_url: String,
      urls: [String],
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
      const urls = this.getUrlsFromEntities(params.entities);
      params.pixiv_url = urls.pixivUrl;
      params.urls = urls.urls;

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
        console.log(`${params.screen_name} is saved.`);
        params.friend_ids = result.ids;
        return this.saveOrUpdate(params);
      });
    });

    this.static('findAll', function(id) {
      return this.find({}).exec();
    });

    this.static('getUrlsFromEntities', function(entities) {
      const urlUrls= entities.url.urls.map((url) => { return url.expanded_url; });
      const descriptionUrls = entities.description.urls.map((url) => { return url.expanded_url; });
      const urls = urlUrls.concat(descriptionUrls).unique();
      const isPixivUrl = (url) => { return url.includes('www.pixiv.net'); }

      const pixivUrl = urls.filter((url) => { return isPixivUrl(url) })[0];
      const otherUrls = urls.filter((url) => { return !isPixivUrl(url) });

      return {
        pixivUrl: pixivUrl,
        urls: otherUrls
      };
    });
  }
};

module.exports = mongoose.model('TwitterUser', new TwitterUser());
