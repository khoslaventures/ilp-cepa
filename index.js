'use strict';

const ilpPacket = require('ilp-packet');
const ildcp = require('ilp-protocol-ildcp');
const crypto = require('crypto');
const connectorMock = require('./src/connector-mock');

const CONFIG = require('./config');
const accounts = [
  'alice',
  'bob'
];

function sha256 (preimage) { return crypto.createHash('sha256').update(preimage).digest(); }

const fulfillment = crypto.randomBytes(32);
const condition = sha256(fulfillment);
// console.log({ fulfillment, condition });

const fulfill = ilpPacket.serializeIlpFulfill({
  fulfillment,
  data: Buffer.from('thank you')
});

connectorMock(accounts, CONFIG.defaultPlugin).then(connector => {
  // ildcp.fetch(connector.getPlugin('alice').sendData.bind(connector)).then(({ clientAddress, assetCode, assetScale }) => {
  //   console.log(clientAddress);
  // });
  connector.getPlugin(accounts[0]).sendData(ildcp.serializeIldcpRequest()).then(fulfill => {
    console.log(ildcp.deserializeIldcpResponse(fulfill));
  });

  // connector.getPlugin('bob').registerDataHandler(data => {
  //   console.log('data showed up at bob!', ilpPacket.deserializeIlpPrepare(data));
  //   return fulfill;
  // })
  // connector.getPlugin('bob').registerMoneyHandler(amount => {
  //   console.log('money showed up at bob!', amount);
  // });
  // connector.getPlugin('bob').sendData(ildcp.serializeIldcpRequest()).then(fulfill => {
  //   const bobInfo = ildcp.deserializeIldcpResponse(fulfill);
  //   const prepare = ilpPacket.serializeIlpPrepare({
  //     amount: '10',
  //     executionCondition: condition,
  //     destination: bobInfo.clientAddress,
  //     data: Buffer.from(['hello, World!']),
  //     expiresAt: new Date(new Date().getTime() + 10000)
  //   });
  //   connector.getPlugin('alice').mirror.sendData(prepare).then(fulfillmentPacket => {
  //     console.log('It worked!', ilpPacket.deserializeIlpFulfill(fulfillmentPacket).fulfillment)
  //     connector.shutdown();
  //   })
  // });
});
