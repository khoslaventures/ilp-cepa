const mocha = require('mocha')
const assert = require('assert')
const utils = require('./utils')

const {
  StreamServer
} = require('./server')
const {
  Client
} = require('./client')
const {
  Forwarder
} = require('./cepa')
const {
  CepaClient
} = require('./cepa-client')

// describe('Test Server', function () {
//   it('should run a server and a client and send a message', async function () {
//     server = new StreamServer('test')
//     await server.ServerSetup()

//     // Prepare SPSP details for STREAM connection
//     // // Can throw JSON in as well for future reference
//     // const connectionSetup = {
//     //     destination_account: server.address,
//     //     shared_secret: server.secret
//     // }
//     // const jsonConnectionSetup = JSON.stringify(connectionSetup)
//     server.Run()

//     // client = new Client(jsonConnectionSetup)
//     client = new Client(server.secret, server.address)
//     await client.Connect()
//     await client.Run()

//     await server.Close()
//   })
// })

describe('Test CEPA Service', function () {
  it('should setup a standard StreamServer, two CEPA Forwarders, and a CEPA client and send an onion msg across', async function () {

    utils.clearWebServer();

    server = new Forwarder('End')
    await server.ServerSetup() // setup server secret and address
    server.Run()

    //await new Promise(done => setTimeout(done, 1000));

    cepa2 = new Forwarder('Hop 2', server.secret, server.address)
    await cepa2.ServerSetup()
    cepa2.Run()

    //await new Promise(done => setTimeout(done, 1000));

    cepa1 = new Forwarder('Hop 1', cepa2.secret, cepa2.address)
    await cepa1.ServerSetup()
    cepa1.Run()

    
    //await new Promise(done => setTimeout(done, 3000));
    

    // sanity check
    // console.log(cepa1.secret, cepa1.address, cepa2.secret, cepa2.address, server.secret, server.address)
    const params = [cepa1.secret, cepa1.address, cepa2.secret, cepa2.address, server.secret, server.address]
    cepaClient = new CepaClient(params)
    
    //await cepaClient.Connect()
    await cepaClient.Run()
  })
})
