const { createConnection} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const crypto = require('crypto');
Error.stackTraceLimit = 100;


const destinationAccount = "private.moneyd.local.Yf2p6YWjkt6038QrKOOgG7cCRkGDr5lHRlRMxTgaDUw.WiBEoA41hhzBhUeFNi6EhuVT"
const destSharedSecret = Buffer.from([203,187,221,142,90,241,13,30,193,137,190,47,60,205,162,204,170,31,245,180,62,107,123,131,56,134,182,38,217,58,81,68])

const cepa_1Account = "private.moneyd.local.zlkzDnr5Q1sUjH3HAKvOxghEAESLUMefXEHRbYjJsZ4.-dTIHUmSGnEAgWwF8p6e8QaF"
const cepa_1SharedSecret = Buffer.from([209,20,189,105,185,18,230,125,109,182,116,146,67,105,187,129,102,137,201,164,13,113,16,28,141,112,132,211,198,27,126,184])

const cepa_2Account = "private.moneyd.local.Alhb6C2esm_wbVytNHaCpBHc-C1TJBwtjbqKkRlzp_E.REl1XygLanGonk5tKApCl3nr"
const cepa_2SharedSecret = Buffer.from([184,198,175,104,65,158,186,108,66,31,180,246,158,59,178,184,69,133,254,99,228,172,109,180,223,109,5,79,126,230,43,177])

function encrypt(data, key) {
  //Encrypts data with key, using AES-256 in counter mode 
  var cipher = crypto.createCipher('aes-256-ctr',key)
  var crypted = cipher.update(data,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function construct_onion_packet(msg) {
  payload = {
    msg: msg, 
    nextHop: "lol_this_doesn't_actually_matter"
  }
  encrypted_msg = encrypt(JSON.stringify(payload), cepa_2SharedSecret)
  console.log ("encrypted_with_cepa_2:" + encrypted_msg)

  payload = {
    msg: encrypted_msg, 
    nextHop: "lol_this_doesn't_actually_matter"
  }
  encrypted_msg = encrypt(JSON.stringify(payload), cepa_1SharedSecret)
  console.log ("encrypted_with_cepa_2_and_cepa1:" + encrypted_msg)
  return encrypted_msg
}


async function run() {
  const msg = "hello world"
  console.log ("msg:" + msg)
  const onion_msg = construct_onion_packet(msg)

  //create connection with the first hop cepa router
  const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount: cepa_1Account,
    sharedSecret: cepa_1SharedSecret  
  })
  const stream = connection.createStream()

  stream.write(onion_msg)
  //stream.write(msg)
  stream.end()
}

run().catch((err) => console.log(err))