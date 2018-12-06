const mocha = require('mocha')
const assert = require('assert')
const {
  StreamServer
} = require('./stream-example/server')
const {
  Client
} = require('./stream-example/client')
const {
  CepaServer
} = require('./src/cepa-server')
const {
  CepaClient
} = require('./src/cepa-client')

describe('Test Server', function () {
  it('should run a server and a client and send a message', async function () {
    let server = new StreamServer('test')
    await server.ServerSetup()

    // Prepare SPSP details for STREAM connection
    // // Can throw JSON in as well for future reference
    // const connectionSetup = {
    //     destination_account: server.address,
    //     shared_secret: server.secret
    // }
    // const jsonConnectionSetup = JSON.stringify(connectionSetup)
    server.Run()

    // client = new Client(jsonConnectionSetup)
    let client = new Client(server.secret, server.address)
    await client.Connect()
    await client.Run()

    await server.Close()
  })
})

describe('Test CEPA Service', function () {
  it('should setup 3 CEPA servers, and a CEPA client and send an onion msg across', async function () {
    let cepa3 = new CepaServer('End', null, null)
    await cepa3.ServerSetup() // setup server secret and address
    cepa3.Run()

    let cepa2 = new CepaServer('Hop 2', cepa3.secret, cepa3.address)
    await cepa2.ServerSetup()
    cepa2.Run()

    let cepa1 = new CepaServer('Hop 1', cepa2.secret, cepa2.address)
    await cepa1.ServerSetup()
    cepa1.Run()

    // sanity check
    // console.log(cepa1.secret, cepa1.address, cepa2.secret, cepa2.address, server.secret, server.address)

    let cepaClient = new CepaClient(cepa1.secret, cepa1.address, cepa2.secret, cepa2.address, cepa3.secret, cepa3.address)
    await cepaClient.Connect()
    await cepaClient.Run()
    // TODO: Terminate tests properly
  })
})
