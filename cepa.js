const {
  createConnection
} = require('ilp-protocol-stream')
const {
  createServer
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const utils = require('./utils')

class Forwarder {
  // TODO: Support generic amount of hops
  constructor(name, nextHopSharedSecret, nextHopAddress) {
    this.name = name
    // Would have to generalize this for a real server
    // Forwarding server details
    this.secret = null
    this.address = null
    this.server = null

    // Forwarding client details
    this.nextHopSharedSecret = nextHopSharedSecret
    this.nextHopAddress = nextHopAddress
    this.nextHopConnection = null
  }

  async ServerSetup() {
    const server = await createServer({
      plugin: getPlugin()
    })

    const addressAndSecret = server.generateAddressAndSecret()
    this.secret = addressAndSecret.sharedSecret
    this.address = addressAndSecret.destinationAccount
    this.server = server
  }

  async handleAndForwardData(encMsg) {
    const serialized_decrypted_data = utils.decrypt(encMsg, this.secret)
    const decrypted_data = JSON.parse(serialized_decrypted_data)
    const {
      msg,
      nextHop
    } = decrypted_data

    console.log("received nextHop:" + nextHop)
    console.log("known nextHop:" + this.nextHopAddress)

    if (!nextHop) {
      console.log("done!")
      console.log("data:" + msg)
      return
    }

    const connection = await createConnection({
      plugin: getPlugin(),
      sharedSecret: this.nextHopSharedSecret,
      destinationAccount: this.nextHopAddress
    })
    this.nextHopConnection = connection

    const stream = connection.createStream()
    stream.write(msg)
    stream.end()
    this.nextHopConnection.end() // can leverage this in some other way if needed
  }

  async Run() {
    this.server.on('connection', (connection) => {
      connection.on('stream', (stream) => {
        // Set the maximum amount of money this stream can receive
        stream.setReceiveMax(10000)

        stream.on('money', (amount) => {
          console.log(`got money: ${amount} on stream ${stream.id}`)
        })

        stream.on('data', (chunk) => {
          // console.log(`got data on stream ${stream.id}: ${chunk.toString('utf8')}`)
          console.log("CEPA-Forwarder - " + this.name + " has retreived some data")
          // should not await, because needs to be able to handle multiple streams down the line.
          this.handleAndForwardData(chunk.toString('utf8'))
        })

        stream.on('end', () => {
          console.log('stream closed')
        })
      })
    })
  }

  async Close() {
    await this.server.close()
  }
}

module.exports = {
  Forwarder,
};

// run().catch((err) => console.log(err))