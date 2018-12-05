const { createConnection} = require('ilp-protocol-stream')
const { createServer } = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const crypto = require('crypto');
Error.stackTraceLimit = Infinity;


const destinationAccount = "private.moneyd.local.MkIapU0PqEV9exxYp2ORuF-hVN0r05zeXVs0K0yX4K0.ZxJPtnB-ffblv4cVbzJTM9aQ"
const destSec = {
  "type": "Buffer", 
  "data": [81,122,233,216,236,99,119,84,111,99,136,101,53,26,156,125,110,113,243,233,182,137,143,209,245,140,132,214,157,61,150,8]
}
const destSharedSecret = Buffer.from(destSec)

console.log(destSharedSecret)
console.log(destinationAccount)

function decrypt(text, key) {
  //Decrypts AES-256 in counter mode encrypted data, using the given key
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  console.log("decrypted data is:" + dec)
  return dec;
}

async function handle_data(data, mySharedSecret) {
  const serialized_decrypted_data = decrypt(data, mySharedSecret)
  const decrypted_data = JSON.parse(serialized_decrypted_data)
  const {payload, nextHop} = decrypted_data

  console.log("received nextHop:"+ nextHop)
  console.log("known nextHop:"+ destinationAccount)

  const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount,
    destSharedSecret
  })

  const stream = connection.createStream()
  stream.write(payload)
  stream.end()
}

async function run () {
  const server = await createServer({
    plugin: getPlugin()
  })

  // These need to be passed to the client through an authenticated communication channel
  const { destinationAccount, sharedSecret } = server.generateAddressAndSecret()

  const obj = {
    destAcct: destinationAccount,
    sec: sharedSecret
  }

  const serializedTestObj = JSON.stringify(obj)
  console.log(serializedTestObj)
  console.log('Stream active!')

  server.on('connection', (connection) => {
    connection.on('stream', (stream) => {
      // Set the maximum amount of money this stream can receive
      stream.setReceiveMax(10000)

      stream.on('money', (amount) => {
        console.log(`got money: ${amount} on stream ${stream.id}`)
      })

      stream.on('data', (chunk) => {
        console.log(`got encypted data on stream ${stream.id}: ${chunk.toString('utf8')}`)
        handle_data(chunk.toString('utf8'), sharedSecret)
      })

      stream.on('end', () => {
        console.log('stream closed')
      })
    })
  })
}

run().catch((err) => console.log(err))