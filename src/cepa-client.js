const {
  createConnection
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')
const utils = require('../lib/utils')

class CepaClient {
  // constructor(serialized_input) {
  //   const json = JSON.parse(serialized_input)
  //   console.log(serialized_input)
  //   this.sharedSecret = Buffer.from(json.shared_secret.data)
  //   this.destinationAccount = json.destination_account
  //   this.connection = null
  // }

  // TODO: Right now the routing is hardcoded and so are the Ephemeral Keys
  // (actually, we're just using the shared secrets for now)
  // First, we need a simple interface for just telling the client the path. A list of
  // nodes in the constructor should do the job. It is outside the scope of the client
  // to know how to find a route of onion routers

  // Topology: Client -> Forwarder1 -> Forwarder2 -> Server

  // Second, we need to have a way to get the Ephemeral Keys of each node
  // We'll need to do this the onion way through DHKE
  // Client obtains an Ephemeral key for each node along the path.
  // We start by connecting Forwarder1. We establish a STREAM connection.
  // We then create an ephemeral key through diffie hellman [1] between
  // Client and Forwarder. Client will then use Forwarder2's asymmetric
  // public key (from some PKI, we can use a flask server) to perform a DHKE
  // with Forwarder2. And so on.

  // If we do ECDH, it seems like Lightning does something similar to BIP32 wallets, and it's better
  // than our scheme because messages going back and forth are less and so are the keys.
  // - Do ECDH with the hop's public key from PKI, and the ephemeral private key (different than above)
  // - This gives a curve point, which is hashed using SHA256 to produce epk_k
  // - Blinding factor is the sha256()
  // - See details: https://github.com/lightningnetwork/lightning-rfc/blob/master/04-onion-routing.md#packet-construction

  // PKI Ideas:
  // Zooko's Triangle comes into play here because we can't really have a decentralized PKI
  // without embedding the public key in the address itself. This is how lightning does it.
  // But ILP did this to make a tradeoff to support more than just cryptocurrencies.

  // [1] (actually, could we just send it in the first hop? STREAM is secured...)
  // When the client start, assume all the servers have been created

  // Replace this with an arglist
  // TODO: Should take in a map of shared secrets and destinations, which is ordered
  constructor (nextSharedSecret, nextHopAddress, next2SharedSecret, next2HopAddress, finalSharedSecret, finalHopAddress) {
    // Given a neighbor secret
    this.nextSharedSecret = nextSharedSecret
    this.nextHopAddress = nextHopAddress

    this.next2SharedSecret = next2SharedSecret
    this.next2HopAddress = next2HopAddress

    this.finalSharedSecret = finalSharedSecret
    this.finalHopAddress = finalHopAddress

    this.connection = null
  }

  async Connect () {
    const connection = await createConnection({
      plugin: getPlugin(),
      sharedSecret: this.nextSharedSecret,
      destinationAccount: this.nextHopAddress
    })
    this.connection = connection
    console.log('Connection created')
  }

  async Run () {
    const msg = 'hello world'
    console.log('CEPA-Client - Sending Message: ' + msg)

    const addresses = [this.nextHopAddress, this.next2HopAddress, this.finalHopAddress]
    const secrets = [this.nextSharedSecret, this.next2SharedSecret, this.finalSharedSecret]
    if (addresses.length !== secrets.length) {
      console.log('ERROR: invalid key/secrets initialization')
    }
    const onionPacket = utils.createOnionPacket(msg, addresses, secrets)

    const stream = this.connection.createStream()
    console.log('CEPA-Client - STREAM Created')
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
  CepaClient
}
