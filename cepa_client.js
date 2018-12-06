const { createConnection} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const crypto = require('crypto');
const assert = require('assert');
Error.stackTraceLimit = 100;


const destinationAccount = "private.moneyd.local.Biqm4Luuc0AaQp65uiZGee64dKFlfHNgSXAc-y8xI6w.A4Vx3SCPWWNLAelUQZFB1jwt"
const destSharedSecret = Buffer.from([148,55,238,47,161,137,32,26,82,161,31,235,30,209,211,235,61,218,225,246,162,17,67,159,232,121,113,222,91,251,87,112])

const cepa_1Account = "private.moneyd.local.0NRDvqUU8w47RfvPCDe-Bsm6KZyZPn_8AUVy_ult4A4.DEv8zyv5dGHbMLNC5dAlgOAf"
const cepa_1SharedSecret = Buffer.from([204,84,72,13,144,184,58,86,105,19,102,199,16,33,117,74,57,95,206,98,166,85,175,66,247,196,4,201,21,54,223,103])

const cepa_2Account  = "private.moneyd.local.cM_oS2RmgSf0IyVsuQaQ0ANTshfZW1qZPe38aTuvoh8.O6n-uBOsjK44Hn-cGtydO7V9"
const cepa_2SharedSecret = Buffer.from([39,4,29,164,86,255,218,99,84,74,242,162,123,189,206,230,61,70,75,142,236,192,244,171,125,189,36,137,10,219,146,51])

const accounts = [cepa_1Account, cepa_2Account, destinationAccount]
const secrets = [cepa_1SharedSecret, cepa_2SharedSecret, destSharedSecret]

//assert.isEqual(accounts.length, secrets.length)
if (accounts.length != secrets.length) {
  console.log("ERROR: invalid key/secrets initialization")
}

function encrypt(data, key) {
  //Encrypts data with key, using AES-256 in counter mode 
  var cipher = crypto.createCipher('aes-256-ctr',key)
  var crypted = cipher.update(data,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function construct_onion_packet(msg) {
  //creates onion wrapped encrypted messages, 
  //using the addresses in accounts for nextHops, 
  //and using the keys in secrets as the ephemeral symmetric keys. 
  //currently the keys are just the shared secrets, but at some point 
  //they should be replaced with real DHKE keys. 


  //TODO: padding
  for (i = accounts.length - 1; i >= 0; i--) {
    nextHop = i >= accounts.length - 1 ? "" : accounts[i + 1]
    encryption_key = secrets[i]
    payload = {
      msg : msg, 
      nextHop: nextHop
    }
    msg = encrypt(JSON.stringify(payload), encryption_key)
  }
   
  console.log(msg)
  return msg
}

async function run() {
  const msg = "hello world"
  console.log ("msg: " + msg)
  const onion_msg = construct_onion_packet(msg)

  //create connection with the first hop cepa router
  const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount: cepa_1Account,
    sharedSecret: cepa_1SharedSecret  
  })
  const stream = connection.createStream()

  stream.write(onion_msg)
  stream.end()
}

run().catch((err) => console.log(err))