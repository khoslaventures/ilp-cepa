const {
  CepaClient
} = require('./src/cepa-client')
const glob = require('glob')

const parseJson = require('json-parse-better-errors')

// TODO: Create function that will input jsons of a certain naming pattern..
// Constructor should then provide interface by which you can enter
const fs = require('fs')
const re = new RegExp('cepa([0-9])+')
var cepas = {} // contains server destination_accountes and shared_secrets for each cepa server

function setup () {
  var files = glob.sync('terraform/cepa*addrsec.json')
  files.forEach(function (file) {
    // TODO: Read and parse json, then add to map
    let rawData = fs.readFileSync(file)
    let addrSec = parseJson(rawData)
    var prefixMatch = file.match(re)
    cepas[prefixMatch[0]] = addrSec
  })
}

async function run () {
  setup()
  var cepa0SharedSecret = Buffer.from(cepas.cepa0.shared_secret)
  var cepa0Address = cepas.cepa0.destination_account
  var cepa1SharedSecret = Buffer.from(cepas.cepa1.shared_secret)
  var cepa1Address = cepas.cepa1.destination_account
  var cepa2SharedSecret = Buffer.from(cepas.cepa2.shared_secret)
  var cepa2Address = cepas.cepa2.destination_account
  // NOTE: The order of hops is flipped.
  let cepaClient = new CepaClient(cepa2SharedSecret, cepa2Address, cepa1SharedSecret, cepa1Address, cepa0SharedSecret, cepa0Address)
  await cepaClient.Connect()
  await cepaClient.Run()
}
run().catch((err) => console.log(err))
