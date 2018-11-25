'use strict';

const CONFIG = require('../config');

module.exports = (namespace) => {

  let logger = require('debug')(namespace);

  function extend (extension) {
    logger.extend(extension);
  }

  function log (line) {
    logger(`${CONFIG.lineDelimiter}  ${line}`);
  }

  return { extend, log };
}