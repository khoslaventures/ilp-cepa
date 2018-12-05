const { createConnection} = require('ilp-protocol-stream')
const { createServer } = require('ilp-protocol-stream')

const getPlugin = require('ilp-plugin')
Error.stackTraceLimit = Infinity;

const destinationAccount = "private.moneyd.local.gad58FDk4_f-w9MQYgSt40g91oHkMdCuJekUa97Zlho.6HvCj5FOkbUqXYndxWcihUgt"
const sharedSecret = Buffer.from([254,244,63,59,37,149,168,44,107,90,157,157,249,61,57,203,136,161,220,188,108,209,70,214,102,48,141,184,214,165,198,170])

console.log(sharedSecret)
console.log(destinationAccount)

async function forward(msg) {
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
        forward(chunk.toString('utf8'))
      })

      stream.on('end', () => {
        console.log('stream closed')
      })
    })
  })
}

run().catch((err) => console.log(err))