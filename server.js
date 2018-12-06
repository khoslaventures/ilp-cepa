const {
  createServer
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const utils = require('./utils')

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

  handleData (encMsg) {
    const decryptSerialBytes = utils.decrypt(encMsg, this.secret)
    const parsedData = JSON.parse(decryptSerialBytes)
    const {
      msg,
      nextHop
    } = parsedData

    console.log('received message: ' + msg)
    console.log('received nextHop: ' + nextHop)
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
          this.handleData(chunk.toString('utf8'))
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
