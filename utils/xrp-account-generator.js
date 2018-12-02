'use strict';

const crypto = require('crypto');
const fetch = require('node-fetch');
const { RippleAPI } = require('ripple-lib');
const { base64url, hmac } = require('./crypto-utils');
const logger = require('./custom-logger');

module.export = async () => {
  const servers = connectorList['test'];
  const defaultParent = servers[Math.floor(Math.random() * servers.length)];
  const rippledServers = rippledList['test'];
  const xrpServer = rippledServers[Math.floor(Math.random() * rippledServers.length)];

  const rippleResponse = await fetch('https://faucet.altnet.rippletest.net/accounts', { method: 'POST' });
  const jsonResponse = await rippleResponse.json();

  const address = jsonResponse.account.address;
  const secret = jsonResponse.account.secret;
  logger.log(`got testnet address ${address}`);

  logger.log('waiting for testnet API to fund address...');
  await validateAddress(xrpServer, address).catch((err) => {
    logger.error('Error configuring uplink: ' + err.message);
    process.exit(1);
  });

  const btpName = base64url(crypto.randomBytes(32));
  const btpSecret = hmac(defaultParent, secret).toString('hex');
  const btpServer = 'btp+wss://' + btpName + ':' + btpSecret + '@' + defaultParent;
  return {
    relation: 'parent',
    plugin: require.resolve('ilp-plugin-xrp-asym-client'),
    assetCode: 'XRP',
    assetScale: 9,
    balance: {
      minimum: '-Infinity',
      maximum: '20000000',
      settleThreshold: '5000000',
      settleTo: '10000000'
    },
    sendRoutes: false,
    receiveRoutes: false,
    options: {
      currencyScale: 9,
      server: btpServer,
      secret: secret,
      address: address,
      xrpServer: xrpServer
    }
  };
};

async function validateAddress (server, address) {
  const api = new RippleAPI({ server });
  await api.connect();
  await api.getAccountInfo(address).catch((err) => {
    if (err.message !== 'actNotFound') throw err;
    throw new Error('Address "' + address + '" does not exist on ' + server);
  });
}

const rippledList = {
  'live': [
    'wss://s1.ripple.com',
    'wss://s2.ripple.com'
  ],
  'test': [
    'wss://s.altnet.rippletest.net:51233'
  ]
};

const connectorList = {
  'live': [
    'btp.strata-ilsp-1.com:8079',
    'btp.strata-ilsp-2.com:8079'
  ],
  'old': [
    'btp.connector0.com',
    'btp.tinypolarbear.com',
    'btp1.mlab.company',
    'btp2.mlab.company',
    'btp3.mlab.company',
    'client.scyl.la',
    'ilp.worldconnector.link',
    'ilp1.internetofvalue.xyz',
    'ilsp1.phobosnode.com'
  ],
  'test': [
    'btp.strata-ilsp-3.com:8083'
  ]
};
