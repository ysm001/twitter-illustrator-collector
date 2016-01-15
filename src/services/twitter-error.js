'use strict';

const TwitterRateLimit = require('./twitter-rate-limit.js');

module.exports = class TwitterError extends Error {
  constructor(message, code, response, method, request, option) {
    super(message);
    this.name = this.constructor.name;
    this.message = message; 
    this.code = code;
    this.rateLimit = new TwitterRateLimit(response);
    this.method = response.req.method;
    this.url = response.req.path;

    Error.captureStackTrace(this, this.constructor.name)
  }
}
