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

    // publish public key and address to directory service 
    const keys = utils.generateKeyPair()
    this.pubkey = keys[0]
    this.privkey = keys[1]

    const data_to_publish = {
      addr: this.address, 
      pubkey: this.pubkey
    }
    utils.postJSONDataToServer(data_to_publish, 'http://hololathe.pythonanywhere.com/publish')
  }

  handleData (encMsg) {
    console.log(encMsg)
    const decryptSerialBytes = utils.decrypt(encMsg, this.secret)
    console.log(decryptSerialBytes)
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
