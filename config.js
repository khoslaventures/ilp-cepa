/* LOGGER */
const nameSpaces = [
  'connectorMock',
  'connectorMock:*'
].join(',');

/* CONNECTOR */
const defaultBackend = 'one-to-one';
const defaultIlpAddress = 'test.cepa';
const defaultStorePath = './data';
const defaultSpread = 0;
const defaultAppConfig = {
  ilpAddress: defaultIlpAddress,
  accounts: {},
  backend: defaultBackend,
  spread: defaultSpread,
  storePath: defaultStorePath
};

/* ACCOUNTS */
const defaultAccountPluginName = 'ilp-plugin-mini-accounts';
const defaultListenerPort = 3000;
const defaultsharedSecret = 'secret';

module.exports = {
  accountConfig: defaultAppConfig,
  pluginName: defaultAccountPluginName,
  ilpAddress: defaultIlpAddress,
  lineDelimiter: '➤',
  listenerPort: defaultListenerPort,
  nameSpace: nameSpaces,
  sharedSecret: defaultsharedSecret
};
