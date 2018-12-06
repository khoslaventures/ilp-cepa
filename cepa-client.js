const {
  createConnection
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const utils = require('./utils')

class CepaClient {
  // constructor(serialized_input) {
  //   const json = JSON.parse(serialized_input)
  //   console.log(serialized_input)
  //   this.sharedSecret = Buffer.from(json.shared_secret.data)
  //   this.destinationAccount = json.destination_account
  //   this.connection = null
  // }

  // When the client start, assume all the servers have been created
  // TODO: Should take in a map of shared secrets and destinations, which is ordered
  constructor(nextSharedSecret, nextHopAddress, next2SharedSecret, next2HopAddress, finalSharedSecret, finalHopAddress) {
    // Given a neighbor secret
    this.nextSharedSecret = nextSharedSecret
    this.nextHopAddress = nextHopAddress

    this.next2SharedSecret = next2SharedSecret
    this.next2HopAddress = next2HopAddress

    this.finalSharedSecret = finalSharedSecret
    this.finalHopAddress = finalHopAddress

    this.connection = null
  }

  async Connect() {
    const connection = await createConnection({
      plugin: getPlugin(),
      sharedSecret: this.nextSharedSecret,
      destinationAccount: this.nextHopAddress
    })
    this.connection = connection
    console.log("Connection created")
  }

  async Run() {
    const msg = "hello world"
    console.log("CEPA-Client - Sending Message: " + msg)

    const addresses = [this.nextHopAddress, this.next2HopAddress, this.finalHopAddress]
    const secrets = [this.nextSharedSecret, this.next2SharedSecret, this.finalSharedSecret]
    if (addresses.length != secrets.length) {
      console.log("ERROR: invalid key/secrets initialization")
    }
    const onionPacket = utils.createOnionPacket(msg, addresses, secrets)

    const stream = this.connection.createStream()
    console.log("CEPA-Client - STREAM Created")
    stream.write(onionPacket)
    // stream.write('hello\n')
    // stream.write('here is some more data')
    // await stream.sendTotal(100)
    // await stream.sendTotal(200)
    stream.end()
    this.connection.end()
  }
}
module.exports = {
  CepaClient,
};