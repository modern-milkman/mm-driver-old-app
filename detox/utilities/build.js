const { existsSync } = require('fs');

const build = {
  isDocker: () => existsSync('/.dockerenv')
};

module.exports = build;
