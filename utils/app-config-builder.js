'use strict';

const assert = require('assert');
const CONFIG = require('../config');

module.exports = (accounts) => {

  let newAccountsConfig = {
    accounts: {}
  }

  for (let i = 0; i < accounts.length; i++) {
    let accountName = accounts[i];
    assert.ok(typeof accountName == 'string');
    let accountOpts = createSingleAccountOptions(accountName);
    newAccountsConfig['accounts'][accountName] = createSingleAccount(accountOpts);
  }

  return Object.assign(CONFIG.accountConfig, newAccountsConfig);
}

function createSingleAccount (accountOpts) {
  return Object.assign(CONFIG.accountOpts, accountOpts);
}

function createSingleAccountOptions (accountName) {
  return {
    options: {
      info: {
        prefix: `${CONFIG.ilpAddress}.${accountName}`
      },
      account: `${CONFIG.ilpAddress}.${accountName}.connector`,
      balance: '0'
    }
  }
}
