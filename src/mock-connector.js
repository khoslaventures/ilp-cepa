'use strict';

const ilpConnector = require('ilp-connector');

const logger = require('../utils/custom-logger')('mock');
const pluginUtils = require('../utils/plugin-utils');

module.exports = async (accountList, ilpAddress) => {
  const config = pluginUtils.configConnector(accountList, ilpAddress);
  const connector = ilpConnector.createApp(config);

  let shuttingDown = false;

  process.on('SIGINT', async () => {
    logger.lineBreak();
    try {
      if (shuttingDown) {
        logger.log('received second SIGINT during graceful shutdown, exiting forcefully...');
        process.exit(1);
      }
      shuttingDown = true;
      logger.log('shutting down...');
      await connector.shutdown();
      logger.log('completed graceful shutdown');
      process.exit(0);
    } catch (err) {
      const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err;
      logger.log('error while shutting down. error=%s', errInfo);
      process.exit(1);
    }
  });

  return connector.listen()
    .catch((err) => {
      const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err;
      logger.log(errInfo);
    }).then(() => {
      return connector;
    });
};
