'use strict';

const CONFIG = require('../config');

module.exports = (namespace) => {
  let logger = require('debug')(CONFIG.namespace);

  logger = logger.extend(namespace);

  function lineBreak () {
    console.log('\n');
  }

  function log (loggedLine) {
    const inputType = typeof loggedLine;
    switch (inputType) {
      case 'object':
        logger(`${CONFIG.lineDelimiter}  %o`, loggedLine);
        break;
      default:
        logger(`${CONFIG.lineDelimiter}  ${loggedLine}`);
    }
  }

  return { lineBreak, log };
};
