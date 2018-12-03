const { createConnection } = require('ilp-protocol-stream')
const getPlugin = require('ilp-plugin')


const serializedObj = '{"destAcct":"test.strata-ilsp-3.xrpTestChildren.8DLTQLfWK3lRHaS5LTJ8Q-AxfSJePb4xEmzpzUfSajE.local.AgA6gao5HBboJ1nvlm62R8kiw8EQq_3ZhPMWSjKdrPw.A1yfrP05GlK_voKaPU8ZqTnw","sec":{"type":"Buffer","data":[155,17,94,53,30,229,60,100,191,105,9,0,160,107,243,152,239,33,197,121,145,56,133,168,69,100,158,172,30,11,105,36]}}'

const data = JSON.parse(serializedObj);
const sharedSecret = Buffer.from(data.sec)
const destinationAccount = data.destAcct
console.log(sharedSecret)
console.log(destinationAccount)

async function run () {
  const connection = await createConnection({
    plugin: getPlugin(),
    destinationAccount,
    sharedSecret
  })

  const stream = connection.createStream()
  stream.write('hello\n')
  stream.write('here is some more data')
  await stream.sendTotal(100)
  await stream.sendTotal(200)
  stream.end()
}

run().catch((err) => console.log(err))
