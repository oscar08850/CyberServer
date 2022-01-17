import express from 'express'
import cors from 'cors'
import * as jose from 'jose'




import * as modelos from './modelos'


//VARIABLES
const port = 3000

 



const { publicKey, privateKey } = jose.generateKeyPair('RSA-OAEP') //USAR RS256 SI NO NOS ACLARAMOS

//const { publicKey, privateKey } = async () => { await jose.generateKeyPair('RSA-OAEP') //USAR RS256 SI NO NOS ACLARAMOS

const publicJwk = jose.exportJWK(publicKey)

console.log("public key")

console.log(publicJwk)

console.log("private key")

console.log(privateKey)



//SERVIDOR
const app = express()
let jwt = require('jsonwebtoken')

app.use(cors({
  origin: 'http://localhost:4200' // angular.js server
}), express.json())

app.get('/', (req, res) => {
  res.send('hello world 2')
})



app.get('/mensaje', async (req, res) => {
  const { publicKey, privateKey } = await jose.generateKeyPair('RSA-OAEP') //USAR RS256 SI NO NOS ACLARAMOS

  const publicJwk = await jose.exportJWK(publicKey)

  console.log("public key")

  console.log(publicJwk)

  console.log("private key")

  console.log(privateKey)

  const secret = await jose.generateSecret('HS256', { extractable: true })
  const secretJwk = await jose.exportJWK(secret)
  console.log(secretJwk)

  const jwt = await new jose.EncryptJWT({ 'secret': secretJwk })
    .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' }) //
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('chat')
    .setExpirationTime('1m')
    .encrypt(publicKey)//public del destino
  
  const { payload } = await jose.jwtDecrypt(jwt, privateKey)
  console.log(payload)
  /*
  const jwt = await new jose.SignJWT({ 'urn:example:claim': true }) //
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime('2h')
    .sign(privateKey)
  console.log("jwt")
*/
  // console.log(jwt)


  // const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
  //   issuer: 'urn:example:issuer',
  //   audience: 'urn:example:audience'
  // })

  // console.log(protectedHeader)
  // console.log(payload)

  res.json({
    publicJwk
  })





})

app.get('/secretKey', async (req, res) => {

  //Recibir la clave publica del otro
  
  const secret = await jose.generateSecret('HS256', { extractable: true })
  const secretJwk = await jose.exportJWK(secret)
  console.log(secretJwk)

  const jwt = await new jose.EncryptJWT({ 'secret': secret })
    .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' }) //
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('chat')
    .setExpirationTime('1m')
    .encrypt(secret)//public del destino

  const jwt2 = await new jose.EncryptJWT({ msg: 'hello f dsa fdsaf' })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }) //alg es256
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('chat')
    .setExpirationTime('20s')
    .encrypt(secret)//con secreto

  console.log(jwt)


})

app.post('/autenticar', (req, res) => {
  if(req.body.usuario === "asfo" && req.body.contrasena === "holamundo") {
  const payload = {
    check:  true
  };
  const token = jwt.sign(payload, app.get('llave'), {
    expiresIn: 1440
  });
  res.json({
    mensaje: 'Autenticación correcta',
    token: token
  });
  } else {
      res.json({ mensaje: "Usuario o contraseña incorrectos"})
  }
})



//SERVIDOR SOCKETS
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
require('./sockets');

server.listen(port, function () {
  console.log(`Listening on http://localhost:${port}`)
})