'use strict';

const CONFIG = require('../config');

module.exports = {
  configConnector,
  configPluginClientBTP,
  configPluginServerBTP,
  configPluginMiniAccount
};

function configConnector (recipe, ilpAddress) {
  let accountsObj = {
    accounts: {}
  };

  recipe.forEach(({ accountName, pluginName, relationType, port }) => {
    let pluginConfig;
    switch (pluginName) {
      case 'BTP-Client':
        pluginConfig = configPluginClientBTP(relationType, port);
        break;
      case 'BTP-Server':
        pluginConfig = configPluginServerBTP(relationType, port);
        break;
      case 'Mini-Account':
        pluginConfig = configPluginMiniAccount(relationType, port);
        break;
      default:
        throw Error('no such plugin');
    }
    accountsObj.accounts[accountName] = pluginConfig;
  });

  let connectorConfig = CONFIG.connectorConfig;
  if (!ilpAddress) {
    delete connectorConfig.ilpAddress;
  }

  return Object.assign(CONFIG.connectorConfig, accountsObj);
}

function configPluginClientBTP (relationType, port) {
  return accountTemplate(
    relationType,
    'ilp-plugin-btp',
    { server: `btp+ws://client:${CONFIG.sharedSecret}@localhost:${port}` }
  );
}

function configPluginServerBTP (relationType, port) {
  return accountTemplate(
    relationType,
    'ilp-plugin-btp',
    { listener: { port: port, secret: CONFIG.sharedSecret } }
  );
}

function configPluginMiniAccount (relationType, port) {
  return accountTemplate(
    relationType,
    'ilp-plugin-mini-accounts',
    { wsOpts: { port } }
  );
}

function accountTemplate (relationType, pluginName, opts) {
  return {
    // ilpAddressSegment: 'connector',
    relation: relationType,
    assetScale: CONFIG.assetScale,
    assetCode: CONFIG.assetCode,
    plugin: pluginName,
    receiveRoutes: true,
    sendRoutes: true,
    options: opts
  };
}

const BtpPacket = require('btp-packet');
const WebSocket = require('ws');

async function sendAuthPacket (serverUrl, account, token) {
  const protocolData = [{
    protocolName: 'auth',
    contentType: BtpPacket.MIME_APPLICATION_OCTET_STREAM,
    data: Buffer.from([])
  }, {
    protocolName: 'auth_username',
    contentType: BtpPacket.MIME_TEXT_PLAIN_UTF8,
    data: Buffer.from(account, 'utf8')
  }, {
    protocolName: 'auth_token',
    contentType: BtpPacket.MIME_TEXT_PLAIN_UTF8,
    data: Buffer.from(token, 'utf8')
  }];

  const ws = new WebSocket(serverUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', () => resolve());
    ws.once('error', (err) => reject(err));
  });

  const result = new Promise((resolve) => {
    ws.on('message', (msg) => {
      resolve(BtpPacket.deserialize(msg));
      ws.close();
    });
  });

  await new Promise((resolve) => ws.send(BtpPacket.serialize({
    type: BtpPacket.TYPE_MESSAGE,
    requestId: 1,
    data: { protocolData }
  }), resolve));

  return result;
}
