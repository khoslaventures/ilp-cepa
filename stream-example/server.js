const {
  createServer
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const utils = require('../lib/utils')

class StreamServer {
  constructor (name) {
    this.name = name
    this.secret = null
    this.address = null
    this.server = null
  }
  async ServerSetup () {
    const server = await createServer({
      plugin: getPlugin()
    })

    const addressAndSecret = server.generateAddressAndSecret()
    this.address = addressAndSecret.destinationAccount
    this.secret = addressAndSecret.sharedSecret
    this.server = server
  }

  async Run () {
    this.server.on('connection', (connection) => {
      connection.on('stream', (stream) => {
        // Set the maximum amount of money this stream can receive
        stream.setReceiveMax(10000)

        stream.on('money', (amount) => {
          console.log(`got money: ${amount} on stream ${stream.id}`)
        })

        stream.on('data', (chunk) => {
          // console.log(`got data on stream ${stream.id}: ${chunk.toString('utf8')}`)
          console.log('Server - ' + this.name + ' has retreived some data')
        })

        stream.on('end', () => {
          console.log('stream closed')
        })
      })
    })
  }

  async Close () {
    await this.server.close()
  }
}
module.exports = {
  StreamServer
}
