const { readFileSync, writeFileSync } = require('fs');

const detox = {
  config: {},
  openDetoxRc: () => (detox.config = JSON.parse(readFileSync('.detoxrc.json'))),
  saveDetoxRc: () =>
    writeFileSync('.detoxrc.json', JSON.stringify(detox.config), {
      encoding: 'utf8'
    })
};

module.exports = detox;
