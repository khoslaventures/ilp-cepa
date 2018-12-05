const {
  createConnection
} = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')


const serializedObj = '{"destAcct":"privateone.moneyd.local.ikSb7Lk1JkBroK5EwE5eJYZ7_KR3iefMZc_VmkRgPig.jlCWLsnx027wwtH_Q13rCgEF","sec":{"type":"Buffer","data":[2,42,3,215,144,131,43,54,173,103,171,20,146,146,3,45,13,120,35,136,189,123,62,95,202,192,215,16,221,168,48,45]}}'

const data = JSON.parse(serializedObj);

const sharedSecret = Buffer.from([21,210,191,124,231,42,231,127,252,38,92,176,91,26,33,239,104,153,96,32,117,29,77,47,30,36,0,108,188,208,244,48])
const destinationAccount = "private.moneyd.local.QmFUjiVuTvvPj9GgMPzlEfvpLbelAcqOZL_jDuLjcc4._XpDWu_izM-_FSHjHXTHnIzk"
console.log(sharedSecret)
console.log(destinationAccount)

async function run() {
  const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount,
    sharedSecret
  })

  const stream = connection.createStream()
  stream.write('hello\n')
  // stream.write('here is some more data')
  // await stream.sendTotal(100)
  // await stream.sendTotal(200)
  stream.end()
}

run().catch((err) => console.log(err))