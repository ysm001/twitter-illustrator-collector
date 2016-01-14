 'use strict';

require('../../lib/array-ext.js');
const twitterConfig = require('../../config/twitter.js');
const Twitter = require('twitter');
const TwitterRateLimit = require('./twitter-rate-limit.js');

class TwitterService {
  constructor(config) {
    this.client = new Twitter(config);
  }

  getFriendIds(option) {
    return this.get('friends/ids', option);
  }

  getUsers(option) {
    const userIds = this.splitArray(option.user_id, 100);
    const promises = userIds.map((userId) => {
      const formattedOption = Object.assign({}, option, {user_id: userId});
      return this.get('users/lookup', formattedOption);
    });

    return Promise.all(promises).then((users) => {
      return users.flatten();
    });
  }

  splitArray(array, size) {
    let result = [];
    for (let i = 0, l = array.length; i < l; i += size) {
      result.push(array.slice(i, i + size).join(','));
    }

    return result
  }

  get(request, option) {
    return this.promisify('get', request, option);
  }

  post(request, option) {
    return this.promisify('post', request, option);
  }

  promisify(method, request, option) {
    const deferred = Promise.defer();
    this.client[method](request, option, (error, result, response) => {
      const rateLimit = new TwitterRateLimit(response);
      if (error) {
        deferred.reject({error: error, rateLimit: rateLimit, response: response});
      } else {
        deferred.resolve(result);
      }
    });

    return deferred.promise;
  }
};

module.exports = new TwitterService(twitterConfig);
