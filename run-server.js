const {
  CepaServer
} = require('./src/cepa-server')

// Look for file in directory. If not there, run with null params.
// Null params means this is an end server.
// Read address and secret from json file

const fs = require('fs')

const inputSecretAndAddress = 'inputaddrsec.json'
const outputFile = './serveraddrsec.json'
const dummyFile = './dummy.json'

async function run () {
  //   if (fs.existsSync(inputSecretAndAddress)) {
  //     const rawData = fs.readFileSync(inputSecretAndAddress)
  //     const jsonData = JSON.parse(rawData)
  //     nextHopSharedSecret = Buffer.from(jsonData.shared_secret)
  //     nextHopAddress = jsonData.destination_account
  //   } else {
  //     console.log('CEPA-Server: First Server!')
  //   }

  var nextHopSharedSecret
  var nextHopAddress

  // Bad code, figure out way to use fs.watch
  while (true) {
    if (fs.existsSync(inputSecretAndAddress)) {
      const rawData = fs.readFileSync(inputSecretAndAddress)
      const jsonData = JSON.parse(rawData)
      nextHopSharedSecret = Buffer.from(jsonData.shared_secret)
      nextHopAddress = jsonData.destination_account
      break
    } else if (fs.existsSync(dummyFile)) {
      nextHopSharedSecret = null
      nextHopAddress = null
      break
    }
  }

  // Would be smart if TF would send the name over.
  var cepa = new CepaServer('CEPA', nextHopSharedSecret, nextHopAddress)
  await cepa.ServerSetup() // setup server secret and address

  // Output the server's secret and address
  const outputSecretAndAddress = {
    destination_account: cepa.address,
    shared_secret: cepa.secret
  }
  const outputData = JSON.stringify(outputSecretAndAddress)

  fs.writeFileSync(outputFile, outputData) // not best practice but easier

  cepa.Run()
  // constructor(serialized_input) {
  //   const json = JSON.parse(serialized_input)
  //   console.log(serialized_input)
  //   this.sharedSecret = Buffer.from(json.shared_secret.data)
  //   this.destinationAccount = json.destination_account
  //   this.connection = null
  // }
}

run().catch((err) => console.log(err))
