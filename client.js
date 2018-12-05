const { createConnection} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const crypto = require('crypto');
Error.stackTraceLimit = Infinity;


const destinationAccount = "private.moneyd.local.MkIapU0PqEV9exxYp2ORuF-hVN0r05zeXVs0K0yX4K0.ZxJPtnB-ffblv4cVbzJTM9aQ"
const destSec = {
  "type": "Buffer", 
  "data": [81,122,233,216,236,99,119,84,111,99,136,101,53,26,156,125,110,113,243,233,182,137,143,209,245,140,132,214,157,61,150,8]
}
const destSharedSecret = Buffer.from(destSec)


const cepa_1Account = "private.moneyd.local.jHLzglnFLbR2VyyZdyl8Y2PL4tOQsTziz9-7GWTudO4.M6BCIIDi5O35Sk-YLDjnxZ6V"
const cepa_1Sec = {
  "type": "Buffer", 
  "data": [125,86,168,215,235,223,72,13,46,9,231,137,127,165,157,217,113,24,108,78,69,139,1,50,38,13,221,123,39,186,66,34]
}
const cepa_1SharedSecret = Buffer.from(cepa_1Sec)

function encrypt(data, key) {
  //Encrypts data with key, using AES-256 in counter mode 
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}


async function construct_onion_packet(msg) {

  const encrypted_msg = encrypt(msg, cepa_1SharedSecret)
  payload = {
    "msg": encrypted_msg, 
    "nextHop": destinationAccount
  }
  return JSON.stringify(payload)
}


async function run() {
  const connection = await createConnection({
    plugin: getPlugin(),
    cepa_1Account,
    cepa_1SharedSecret
  })

  
  const stream = connection.createStream()

  const msg = "hello world"
  const onion_msg = construct_onion_packet(msg)
  
  //stream.write(onion_msg)
  stream.write(msg)
  stream.end()
}

run().catch((err) => console.log(err))