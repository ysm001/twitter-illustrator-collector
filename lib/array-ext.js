'use strict';

require('array-sugar');

Array.prototype.flatten = function() {
  return Array.prototype.concat.apply([], this);
};
