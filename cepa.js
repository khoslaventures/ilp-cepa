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
  constructor (name, nextHopSharedSecret, nextHopAddress) {
    this.name = name
  }

  async ServerSetup () {
    const server = await createServer({
      plugin: getPlugin()
    })


    const addressAndSecret = server.generateAddressAndSecret()
    this.secret = addressAndSecret.sharedSecret
    this.address = addressAndSecret.destinationAccount
    this.server = server

    //publish public key and address to directory service 
    const keys = utils.generateKeyPair()
    this.pubkey = keys[0]
    this.privkey = keys[1]

    const data_to_publish = {
      addr: this.address, 
      pubkey: this.secret
    }

    utils.postJSONDataToServer(data_to_publish, 'http://hololathe.pythonanywhere.com/publish')
  }

  async handleAndForwardData (encMsg) {
    const decryptSerialBytes = utils.decrypt(encMsg, this.secret)
    console.log(decryptSerialBytes)
    const parsedData = JSON.parse(decryptSerialBytes)
    const {
      msg,
      nextHop
    } = parsedData

    console.log('Received nextHop:' + nextHop)

    if (!nextHop) {
      console.log('done!')
      console.log('data:' + msg)
      return
    }

    console.log("Creating next STREAM connection")
    const url = "http://hololathe.pythonanywhere.com/get_addresses"
    utils.getJSONDataFromServer(url, function (results) {
      const serverResponse = JSON.parse(results)
      const nextHopSecret = Buffer.from(serverResponse[nextHop])

      utils.connectToNextHop(nextHop, nextHopSecret, function (connection) {
        console.log('CEPA-Server - STREAM Created')
        const stream = connection.createStream()
        stream.write(msg)
        stream.end()
        connection.end()
      })
    })
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
          console.log('CEPA-Forwarder - ' + this.name + ' has retreived some data')
          // should not await, because needs to be able to handle multiple streams down the line.
          console.log(chunk)
          this.handleAndForwardData(chunk.toString('utf8'))
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
  Forwarder
}

// run().catch((err) => console.log(err))
