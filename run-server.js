// Look for file in directory. If not there, run with null params.
// Null params means this is an end server.
// Read address and secret from json file
input_secret = ""

function
let cepa = new CepaServer('End', null, null)
await cepa.ServerSetup() // setup server secret and address
cepa.Run()
