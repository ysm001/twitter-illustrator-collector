 'use strict';

require('../../lib/array-ext.js');
const twitterConfig = require('../../config/twitter.js');
const Twitter = require('twitter');
const TwitterError = require('./twitter-error.js');
const TwitterErrorCode = require('./twitter-error-code.js');

class TwitterService {
  constructor(config) {
    this.client = new Twitter(config);
    // this.client = {
    //   get: (url, option, callback) => {
    //     const rand = parseInt(Math.random() * 10);
    //     console.log(rand);
    //     if (rand < 3) {
    //       callback(null, 'ok');
    //     } else {
    //       callback([{code: 88, message: 'test'}], null, {headers: {'x-rate-limit-reset': (Date.now() + 3000)/1000 }, req:{}});
    //     }
    //   }
    // }
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
    return this.retryExec('get', request, option);
  }

  post(request, option) {
    return this.retryExec('post', request, option);
  }

  retryExec(method, request, option) {
    const func = this.exec.bind(this, method, request, option);

    return this.retry(func, (error) => {
      if (error.code == TwitterErrorCode.RATE_LIMIT_EXCEEDED) {
        const waitTime = (error.rateLimit.reset - Date.now() / 1000) * 1000;
        console.log(`${new Date()}: Wait "${error.method} ${error.url}" for ${parseInt(waitTime / 1000)} sec...`);
        return waitTime
      }

      return false;
    });
  }

  exec(method, request, option, successCallback, errorCallback) {
    this.client[method](request, option, (errors, result, response) => {
      if (errors) {
        const error = errors[0];
        errorCallback(new TwitterError(error.message, error.code, response));
      } else {
        successCallback(result);
      }
    });
  }

  retry(func, timeoutFunc, promise) {
    const deferred = promise || Promise.defer();
    const timeout = timeoutFunc || () => { return 1000; }

    func(deferred.resolve, (error) => {
      const interval = timeout(error); 
      if (interval === false) {
        return deferred.reject(error);
      }

      setTimeout(() => {
        this.retry(func, timeoutFunc, deferred);
      }, interval);
    });

    return deferred.promise;
  }

  promisify(method, request, option) {
    const deferred = Promise.defer();
    this.exec(method, request, option, deferred.resolve, deferred.reject);

    return deferred.promise;
  }
};

module.exports = new TwitterService(twitterConfig);
