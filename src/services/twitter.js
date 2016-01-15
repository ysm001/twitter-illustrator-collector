 'use strict';

require('../../lib/array-ext.js');
const twitterConfig = require('../../config/twitter.js');
const Twitter = require('twitter');
const TwitterError = require('./twitter-error.js');
const TwitterErrorCode = require('./twitter-error-code.js');

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

  retry(promise) {
    return promise.catch((error) => {
      if (error.code == TwitterErrorCode.RATE_LIMIT_EXCEEDED) {
        const waitTime = (error.rateLimit.reset - Date.now() / 1000) * 1000;
        console.log(`wait "${error.method} ${error.url}" for ${parseInt(waitTime / 1000)} sec...`);
        setTimeout(this.retry.bind(this, promise), waitTime);
      }

      throw error;
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
    const promise = this.promisify('get', request, option);

    return option.retry === false ? promise : this.retry(promise);
  }

  post(request, option) {
    return this.promisify('post', request, option);
  }

  promisify(method, request, option) {
    const deferred = Promise.defer();
    this.client[method](request, option, (errors, result, response) => {
      if (errors) {
        const error = errors[0];
        deferred.reject(new TwitterError(error.message, error.code, response));
      } else {
        deferred.resolve(result);
      }
    });

    return deferred.promise;
  }
};

module.exports = new TwitterService(twitterConfig);
