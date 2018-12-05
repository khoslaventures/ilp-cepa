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

  constructor(shared_secret, destination_account) {
    this.sharedSecret = shared_secret
    this.destinationAccount = destination_account
    this.connection = null
  }

  async connect() {
    const connection = await createConnection({
      plugin: getPlugin(),
      sharedSecret: this.sharedSecret,
      destinationAccount: this.destinationAccount
    })
    this.connection = connection
    console.log("Connection created")
  }

  async run() {
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