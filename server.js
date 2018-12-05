const {
  createServer
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')

Error.stackTraceLimit = Infinity;

class StreamServer {
  constructor(name, amount) {
    this.name = name
    this.secret = ""
    this.address = ""
    this.amount = amount
    this.server = null
  }
  async setup() {
    const server = await createServer({
      plugin: getPlugin()
    })

    // TODO: Not Urgent - There's probably a better way of doing this
    const addressAndSecret = server.generateAddressAndSecret()
    this.address = addressAndSecret.destinationAccount
    this.secret = addressAndSecret.sharedSecret
    this.server = server
  }

  async run() {
    this.server.on('connection', (connection) => {
      connection.on('stream', (stream) => {
        // Set the maximum amount of money this stream can receive
        stream.setReceiveMax(10000)

        stream.on('money', (amount) => {
          console.log(`got money: ${amount} on stream ${stream.id}`)
        })

        stream.on('data', (chunk) => {
          console.log(`got data on stream ${stream.id}: ${chunk.toString('utf8')}`)
        })

        stream.on('end', () => {
          console.log('stream closed')
        })
      })
    })
  }

  async close() {
    await this.server.close()
  }
}
module.exports = {
  StreamServer,
};