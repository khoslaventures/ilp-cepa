const {
  createConnection
} = require('ilp-protocol-stream')
const {
  createServer
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const utils = require('./utils')
const crypto = require('crypto')

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
    this.ephemeral_key = null 

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

  async sendDHKEResponse(key, theirAddr, theirSecret, myAddr, mySecret) {
    //create new stream connection to client. 
    //send key over it. 
    utils.connectToNextHop(theirAddr, Buffer.from(theirSecret), function (connection) {
        console.log('DHKE STREAM to client Created, with params:')
        console.log(theirAddr)
        //console.log(theirSecret)
        const stream = connection.createStream()
        const DHKEpacket = {
          key: key,
          msg_type: "DHKE",
          senderAddr: myAddr,
          senderSecret: Buffer.from(mySecret)
        }
        stream.write(JSON.stringify(DHKEpacket))
        //stream.end()
        //connection.end()
      })
  }

  async setupDHKE(msg, myAddr, mySecret) {
    const parsedData = JSON.parse(msg)
    //console.log(parsedData)
    console.log("DHKE message type: " + parsedData['msg_type']) //should be DHKE
    const clientKey = parsedData.key
    console.log("clientKey:"+ clientKey)

    //generate shared secret 
    const myPrivateKey = crypto.createECDH('secp521r1')
    const myPublicKey = myPrivateKey.generateKeys()
    this.ephemeral_key = myPrivateKey.computeSecret(Buffer.from(clientKey))

    this.sendDHKEResponse(myPublicKey, parsedData['senderAddr'], parsedData['senderSecret'], myAddr, mySecret)
  }

  async handleAndForwardData (encMsg) {
    const decryptSerialBytes = utils.decrypt(encMsg, this.secret)
    console.log(decryptSerialBytes)
    const parsedData = JSON.parse(decryptSerialBytes)
    const {
      msg,
      msg_type,
      nextHop
    } = parsedData
    
    //msg_type == "CEPA"
    console.log("msg_type:"+ msg_type)
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
        //stream.end()
        //connection.end()
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
          //console.log(chunk)
          if (!this.ephemeral_key) {
            this.handleAndForwardData(chunk.toString('utf8'))  
          } else {
            this.setupDHKE(chunk.toString('utf8'), this.address, this.secret)
          }
          
        })


        stream.on('end', () => {
          console.log('cepa stream closed')
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
