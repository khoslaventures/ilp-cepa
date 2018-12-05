const mocha = require('mocha');
const assert = require('assert');
const {
    StreamServer
} = require("./server");
const {
    Client
} = require("./client");

describe('Test Server', function () {
    it('should run a server and send a message', async () => {
        server = new StreamServer("test", 10000);
        await server.setup()

        // Prepare SPSP details for STREAM connection
        // const connectionSetup = {
        //     destination_account: server.address,
        //     shared_secret: server.secret
        // }
        // const jsonConnectionSetup = JSON.stringify(connectionSetup)
        await server.run()

        // client = new Client(jsonConnectionSetup)
        client = new Client(server.secret, server.address);
        await client.connect();
        await client.run();

        await server.close()
    });
});