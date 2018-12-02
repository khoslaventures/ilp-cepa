'use strict';

const crypto = require('crypto');

module.exports = { base64url, generateRandomBytes, hmac, sha256 };

function base64url (buf) {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function hmac (key, message) {
  const h = crypto.createHmac('sha256', key);
  h.update(message);
  return h.digest();
}

function generateRandomBytes () { return crypto.randomBytes(32); }

function sha256 (preimage) { return crypto.createHash('sha256').update(preimage).digest(); }
