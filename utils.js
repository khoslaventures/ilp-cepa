const crypto = require('crypto')
const request = require('request')
const http = require('http')
const {createConnection} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')

function encrypt (data, key) {
  // Encrypts data with key, using AES-256 in counter mode
  var cipher = crypto.createCipher('aes-256-ctr', key)
  var crypted = cipher.update(data, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt (data, key) {
  // Decrypts AES-256 in counter mode encrypted data, using the given key
  var decipher = crypto.createDecipher('aes-256-ctr', key)
  var dec = decipher.update(data, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

function generateKeyPair() {
  var prime_length = 160;
  var diffHell = crypto.createDiffieHellman(prime_length);
  diffHell.generateKeys('hex');
  var pubkey =  diffHell.getPublicKey('hex')
  var privkey = diffHell.getPrivateKey('hex')
  return [pubkey, privkey]
}

function postJSONDataToServer(jsonData, url) {
  request.post(
    url,
    { json: jsonData },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //console.log(body)
      }
    }
  );
}

function getJSONDataFromServer (url, callback) {
    http.get(url,function (res) {
        res.on('data', function (d) {
            callback(d);
        });
        res.on('error', function (e) {
            console.error(e);
        });
    });
}

async function connectToNextHop (addr, secret, callback) {
    const connection = await createConnection({
      plugin: getPlugin(),
      sharedSecret: secret,
      destinationAccount: addr
    })
    callback(connection)
  }

function clearWebServer() {
  options = {
    "method":"GET",
    "url": "http://hololathe.pythonanywhere.com/clear_data",
    "headers": {
        "Accept": "text/plain"
    }
  }
request(options, function(err, response) {
  var out = err || "OK" 
  console.log(out)
})
}

function createOnionPacket (msg, accounts, secrets) {
  // Input: A message, list of accounts ordered by hop, list of secrets ordered by hop
  // Creates onion wrapped encrypted messages, using the
  // addresses listed in hop order, and using the secrets as
  // keys for the ephemeral symmetric keys. TODO: Replace with
  // real ECDH keys.
  // Payload includes an onion-wrapped message along with the nextHop.

  // TODO: padding
  console.log("message to onion wrap: " + msg)
  for (i = accounts.length - 1; i >= 0; i--) {
    //console.log(i)
    var nextHop = i >= accounts.length - 1 ? '' : accounts[i + 1]
    var encryption_key = secrets[i]

    var payload = {
      msg,
      msg_type: "CEPA",
      nextHop: nextHop
    }

    console.log("encryption start.............")
    var starttime  = new Date().getTime()
    var msg = encrypt(JSON.stringify(payload), encryption_key)
    var endtime = new Date().getTime()
    console.log(endtime - starttime)
    console.log("encryption end.............")

    console.log("hash start.............")
    starttime  = new Date().getTime()
    var h = crypto.createHmac('sha256', secrets[0]).update(msg).digest('hex')
    endtime = new Date().getTime()
    console.log(endtime - starttime)
    console.log("hash end.............")

  }

  console.log("onion wrapped message:" + msg)
  return msg
}

module.exports.decrypt = decrypt
module.exports.encrypt = encrypt
module.exports.createOnionPacket = createOnionPacket
module.exports.generateKeyPair = generateKeyPair
module.exports.postJSONDataToServer = postJSONDataToServer
module.exports.getJSONDataFromServer = getJSONDataFromServer
module.exports.clearWebServer = clearWebServer
module.exports.connectToNextHop = connectToNextHop