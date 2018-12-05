const { createConnection} = require('ilp-protocol-stream')
const { createServer } = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const crypto = require('crypto');
Error.stackTraceLimit = Infinity;


const destinationAccount = "private.moneyd.local.Alhb6C2esm_wbVytNHaCpBHc-C1TJBwtjbqKkRlzp_E.REl1XygLanGonk5tKApCl3nr"
const sharedSecret = Buffer.from([184,198,175,104,65,158,186,108,66,31,180,246,158,59,178,184,69,133,254,99,228,172,109,180,223,109,5,79,126,230,43,177])

console.log(sharedSecret)
console.log(destinationAccount)

function decrypt(data, key) {
  //Decrypts AES-256 in counter mode encrypted data, using the given key
  var decipher = crypto.createDecipher('aes-256-ctr',key)
  var dec = decipher.update(data,'hex','utf8')
  dec += decipher.final('utf8');
  console.log("decrypted data is:" + dec)
  return dec;
}

async function handle_data(encypted_msg, mySharedSecret) {
  const serialized_decrypted_data = decrypt(encypted_msg, mySharedSecret)
  const decrypted_data = JSON.parse(serialized_decrypted_data)
  const {msg, nextHop} = decrypted_data

  console.log("received nextHop:"+ nextHop)
  console.log("known nextHop:"+ destinationAccount)

  const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount,
    sharedSecret
  })

  const stream = connection.createStream()
  stream.write(msg)
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
        console.log(`got data on stream ${stream.id}: ${chunk.toString('utf8')}`)
        handle_data(chunk.toString('utf8'), sharedSecret)
      })

      stream.on('end', () => {
        console.log('stream closed')
      })
    })
  })
}

run().catch((err) => console.log(err))