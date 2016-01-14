var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'illustrator-collector'
    },
    port: 3000,
    db: 'mongodb://localhost/illustrator-collector-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'illustrator-collector'
    },
    port: 3000,
    db: 'mongodb://localhost/illustrator-collector-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'illustrator-collector'
    },
    port: 3000,
    db: 'mongodb://localhost/illustrator-collector-production'
  }
};

module.exports = config[env];
