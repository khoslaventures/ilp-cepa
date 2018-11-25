/* LOGGER */
const nameSpaces = [
  'connectorMock',
  'connectorMock:*'
]

/* CONNECTOR */
const defaultBackend = 'one-to-one'
const defaultIlpAddress = 'test.cepa';
const defaultStorePath = './data';
const defaultSpread = 0;
const defaultAppConfig = {
  ilpAddress: defaultIlpAddress,
  accounts: {},
  backend: defaultBackend,
  spread: defaultSpread,
  storePath: defaultStorePath
}

/* ACCOUNTS */
const defaultAccountPlugin = 'ilp-plugin-btp';
const defaultAccountOpts = {
  relation: 'child',
  assetScale: 9,
  assetCode: 'XRP',
  plugin: defaultAccountPlugin,
  options: {
    info: {
      prefix: ''
    },
    account: '',
    balance: {
      minimum: '-Infinity',
      maximum: 'Infinity',
      settleThreshold: '-Infinity'
    }
  }
}

module.exports = {
  lineDelimiter: '➤',
  ilpAddress: defaultIlpAddress,
  accountConfig: defaultAppConfig,
  accountOpts: defaultAccountOpts,
  nameSpace: nameSpaces.join(',')
}