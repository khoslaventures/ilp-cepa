'use strict';

const getPort = require('get-port');
const ilpPacket = require('ilp-packet');
const ildcp = require('ilp-protocol-ildcp');
const ilpStream = require('ilp-protocol-stream');
const PluginBtp = require('ilp-plugin-btp');
const { Reader, Writer } = require('oer-utils');
const Prometheus = require('prom-client');

const { generateRandomBytes, sha256 } = require('./utils/crypto-utils');
const logger = require('./utils/custom-logger')('example');
const mockConnector = require('./src/mock-connector');

const CONFIG = require('./config');

async function main () {
  const [portA, portB, portC, portD] = await Promise.all([0, 0, 0, 0].map(() => { return getPort(); }));

  // const connectorAccountListParent = [
  //   { accountName: 'alice', pluginName: 'BTP-Server', relationType: 'child', port: portA },
  //   { accountName: 'bob', pluginName: 'BTP-Server', relationType: 'child', port: portB }
  // ];
  // const connectorAccountListChildA = [
  //   { accountName: 'aliceUp', pluginName: 'BTP-Client', relationType: 'parent', port: portA },
  //   { accountName: 'aliceLocal', pluginName: 'Mini-Account', relationType: 'child', port: portC },
  //   { accountName: 'messenger', pluginName: 'BTP-Client', relationType: 'child', port: portC }
  // ];
  // const connectorAccountListChildB = [
  //   { accountName: 'bobUp', pluginName: 'BTP-Client', relationType: 'parent', port: portB },
  //   { accountName: 'bobLocal', pluginName: 'Mini-Account', relationType: 'child', port: portD },
  //   { accountName: 'messenger', pluginName: 'BTP-Client', relationType: 'child', port: portD }
  // ];

  const connectorAccountListParent = [
    { accountName: 'alice', pluginName: 'Mini-Account', relationType: 'child', port: portA },
    { accountName: 'bob', pluginName: 'Mini-Account', relationType: 'child', port: portB }
  ];
  const connectorAccountListChildA = [
    { accountName: 'aliceLocal', pluginName: 'BTP-Client', relationType: 'parent', port: portA }
  ];
  const connectorAccountListChildB = [
    { accountName: 'bobLocal', pluginName: 'BTP-Client', relationType: 'parent', port: portB }
  ];

  Prometheus.register.clear();
  const connectorParent = await mockConnector(connectorAccountListParent, CONFIG.ilpPrefix);
  Prometheus.register.clear();
  const connectorChildA = await mockConnector(connectorAccountListChildA);
  Prometheus.register.clear();
  const connectorChildB = await mockConnector(connectorAccountListChildB);

  /* ILP/ILDCP Experiment */

  const ildcpRequest = await connectorChildA.getPlugin('aliceLocal').sendData(ildcp.serializeIldcpRequest());
  const ildcpResponse = await ildcp.deserializeIldcpResponse(ildcpRequest);
  console.log('ILDCP works!', ildcpResponse);

  const fulfillment = generateRandomBytes();
  const condition = sha256(fulfillment);
  const writer = new Writer();
  writer.write(Buffer.from('ECHOECHOECHOECHO', 'ascii'));
  writer.writeUInt8(0x00);
  const prepare = ilpPacket.serializeIlpPrepare({
    amount: '10',
    executionCondition: condition,
    destination: ildcpResponse.clientAddress,
    data: writer.getBuffer(),
    expiresAt: new Date(new Date().getTime() + 10000000000)
  });

  const prepareRequest = await connectorChildB.getPlugin('bobLocal').sendData(prepare);
  const prepareResponse = await ilpPacket.deserializeIlpPacket(prepareRequest);
  console.log(prepareResponse);

  /* STREAM Experiment */

  // const btpA = new PluginBtp({
  //   server: `btp+ws://:blah@localhost:${portC}`
  // });
  // const btpB = new PluginBtp({
  //   server: `btp+ws://:blah@localhost:${portD}`
  // });

  // const streamServer = await ilpStream.createServer({ plugin: btpA });

  // streamServer.on('connection', (connection) => {
  //   connection.on('stream', (strm) => {
  //     strm.setReceiveMax(10);
  //   });
  // });

  // const streamClient = await ilpStream.createConnection({
  //   plugin: btpB,
  //   ...(streamServer.generateAddressAndSecret())
  // });

  // const stream = streamClient.createStream()
  // stream.end();
  // streamServer.close();

  console.log('bye');

  await connectorChildB.shutdown();
  await connectorChildA.shutdown();
  await connectorParent.shutdown();

  process.exit(0);
}

main();
