const {
  CepaServer
} = require('./src/cepa-server')

const parseJson = require('json-parse-better-errors')

// Look for file in directory. If not there, run with null params.
// Null params means this is an end server.
// Read address and secret from json file

const fs = require('fs')

const inputSecretAndAddress = 'inputaddrsec.json'
const outputFile = './serveraddrsec.json'
const dummyFile = './dummy.json'

var nextHopSharedSecret = null
var nextHopAddress = null

async function run () {
  console.log('File found, server setting up')
  console.log('NextHop: ' + nextHopAddress)

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

  console.log('CEPA Running!')
  await cepa.Run()
}

function waitForFile () {
  console.log('Looking for .json secrets and address...')
  // Bad code, figure out way to use fs.watch
  while (true) {
    if (fs.existsSync(inputSecretAndAddress)) {
      const rawData = fs.readFileSync(inputSecretAndAddress)
      console.log(rawData)
      const jsonData = parseJson(rawData)
      nextHopSharedSecret = Buffer.from(jsonData.shared_secret)
      nextHopAddress = jsonData.destination_account
      break
    } else if (fs.existsSync(dummyFile)) {
      break
    }
  }
}

waitForFile()
run().catch((err) => console.log(err))
