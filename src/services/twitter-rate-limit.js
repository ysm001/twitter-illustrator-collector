'use strict';

module.exports = class TwitterRateLimit {
  constructor(response) {
    this.limit = parseInt(response.headers['x-rate-limit-limit']);
    this.remaining = parseInt(response.headers['x-rate-limit-remaining']);
    this.reset = parseInt(response.headers['x-rate-limit-reset']);
  }
};
