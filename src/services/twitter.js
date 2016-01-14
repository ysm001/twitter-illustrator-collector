'use strict';

const twitterConfig = require('../../config/twitter.js');
const Twitter = require('twitter');

class TwitterService {
  constructor(config) {
    this.client = new Twitter(config);
  }

  getFriendsIds(option) {
    return this.get('friends/ids', option).then((result) => {
      console.log(result);
    });
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
      if (error) {
        defered.reject(error);
      } else {
        deferred.resolve(result, response);
      }
    });

    return deferred.promise;
  }
};

module.exports = new TwitterService(twitterConfig);
