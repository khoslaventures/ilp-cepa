const {
  createConnection
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')

class Client {
  // constructor(serialized_input) {
  //   const json = JSON.parse(serialized_input)
  //   console.log(serialized_input)
  //   this.sharedSecret = Buffer.from(json.shared_secret.data)
  //   this.destinationAccount = json.destination_account
  //   this.connection = null
  // }

  // When the client start, assume all the servers have been created
  // TODO: Takes in a map of shared secrets and destinations, which is ordered
  constructor(sharedSecret, destinationAddr) {
    // Given a neighbor secret
    this.nextSharedSecret = sharedSecret
    this.nextHopAddress = destinationAddr
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
    const stream = this.connection.createStream()
    console.log("STREAM created")

    stream.write('hello\n')
    // stream.write('here is some more data')
    // await stream.sendTotal(100)
    // await stream.sendTotal(200)
    stream.end()
    this.connection.end()
  }
}
module.exports = {
  Client,
};