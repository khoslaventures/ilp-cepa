const projectName = 'cepa';
const defaultIlpPrefix = `example.${projectName}`;

/* LOGGER */
const defaultLineDelimiter = '➤';

/* CONNECTOR */
const defaultBackend = 'one-to-one';
const defaultAdminApiPort = 3000;
const defaultIlpAddress = `${defaultIlpPrefix}.~`;
const defaultStorePath = './data';
const defaultSpread = 0;
const defaultConnectorConfig = {
  ilpAddress: defaultIlpAddress,
  accounts: {},
  // adminApi: true,
  // adminApiPort: defaultAdminApiPort,
  backend: defaultBackend,
  // storePath: defaultStorePath,
  store: 'ilp-store-memory',
  spread: defaultSpread
};

/* ACCOUNTS */
const defaultAssetCode = 'XRP';
const defaultAssetScale = 9;
const defaultPluginBTP = 'ilp-plugin-btp';
const defaultPluginMA = 'ilp-plugin-mini-accounts';

/* PLUGIN OPTIONS */
const defaultListenerPort = 3001;
const defaultSharedSecret = 'secret';

module.exports = {
  namespace: projectName,
  /* LOGGER */
  lineDelimiter: defaultLineDelimiter,
  /* CONNECTOR */
  connectorConfig: defaultConnectorConfig,
  /* ACCOUNTS */
  assetCode: defaultAssetCode,
  assetScale: defaultAssetScale,
  ilpPrefix: defaultIlpPrefix,
  defaultPlugin: defaultPluginBTP,
  childPlugin: defaultPluginMA,
  /* PLUGIN OPTIONS */
  listenerPort: defaultListenerPort,
  sharedSecret: defaultSharedSecret
};
