const crypto = require('crypto')

function encrypt (data, key) {
  // Encrypts data with key, using AES-256 in counter mode
  var cipher = crypto.createCipher('aes-256-ctr', key)
  var crypted = cipher.update(data, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt (data, key) {
  // Decrypts AES-256 in counter mode encrypted data, using the given key
  var decipher = crypto.createDecipher('aes-256-ctr', key)
  var dec = decipher.update(data, 'hex', 'utf8')
  dec += decipher.final('utf8')
  // console.log("decrypted data is:" + dec)
  return dec
}

function createOnionPacket (msg, accounts, secrets) {
  // Input: A message, list of accounts ordered by hop, list of secrets ordered by hop
  // Creates onion wrapped encrypted messages, using the
  // addresses listed in hop order, and using the secrets as
  // keys for the ephemeral symmetric keys. TODO: Replace with
  // real ECDH keys.
  // Payload includes an onion-wrapped message along with the nextHop.

  // TODO: padding
  for (var i = accounts.length - 1; i >= 0; i--) {
    let nextHop = i >= accounts.length - 1 ? '' : accounts[i + 1]
    let encKey = secrets[i]
    let payload = {
      msg: msg,
      nextHop: nextHop
    }
    msg = encrypt(JSON.stringify(payload), encKey)
  }

  // console.log(msg)
  return msg
}

module.exports.decrypt = decrypt
module.exports.encrypt = encrypt
module.exports.createOnionPacket = createOnionPacket
