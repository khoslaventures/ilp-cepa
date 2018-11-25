'use strict';

const assert = require('assert');
const CONFIG = require('../config');

module.exports = (accounts, pluginName) => {
  return Object.assign(CONFIG.accountConfig, ((accounts, pluginName) => {
    let newAccountsConfig = {
      accounts: {}
    };

    accounts.forEach((accountName, i) => {
      assert.ok(typeof accountName === 'string');
      let accountOpts = createSingleAccountOptions(accountName, i);
      newAccountsConfig['accounts'][accountName] = createSingleAccount(accountOpts, pluginName);
    });

    return newAccountsConfig;
  })(accounts, pluginName));
};

function createSingleAccount (newAccountOpts, pluginName) {
  let accountOpts = {
    relation: 'child',
    assetScale: 9,
    assetCode: 'XRP',
    plugin: pluginName || CONFIG.pluginName,
    options: {}
  };

  return Object.assign(accountOpts, newAccountOpts);
}

function createSingleAccountOptions (accountName, i) {
  return {
    options: {
      info: {
        prefix: `${CONFIG.ilpAddress}.${accountName}`
      },
      account: `${CONFIG.ilpAddress}.${accountName}.connector`,
      balance: {
        minimum: '-Infinity',
        maximum: 'Infinity',
        settleThreshold: '-Infinity'
      },
      /* FOR ILP-PLUGIN-BTP */
      listener: {
        port: CONFIG.listenerPort + i,
        secret: CONFIG.sharedSecret
      },
      /* FOR ILP-PLUGIN-MINI-ACCOUNTS */
      wsOpts: {
        port: CONFIG.listenerPort + i
      }
    }
  };
}
