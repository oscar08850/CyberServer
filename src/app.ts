import express from 'express'
import cors from 'cors'
import * as jose from 'jose'
import { Usuario } from "./usuario"
import * as modelos from './modelos'
import { JWK } from 'jose'

// "npm start" para ejecutarlo


//VARIABLES

const port = 3000

 ///////////*****//////////
//     Esto son pruebas

///Hay que generar las claves aquí, no dentro de una ruta para que sean fijas y no cambien cada vez. Pero el metodo await no lo coge.
// documentacion metodo generate key: https://github.com/panva/jose/blob/v3.x/docs/functions/util_generate_key_pair.generateKeyPair.md#readme

//let keyRSA: jose.GenerateKeyPairResult;
//const prueba = jose.exportJWK(keyRSA.publicKey)

let publickeyServidor: JWK = {};
let privatekeyServidor: JWK = {};

const myAsynFunction = async (): Promise<jose.GenerateKeyPairResult> => {
    const { publicKey, privateKey } = await jose.generateKeyPair('RSA-OAEP')
    publickeyServidor = await jose.exportJWK(publicKey)
    privatekeyServidor = await jose.exportJWK(privateKey) 
    //console.log(publickeyServidor)
    //console.log(privatekeyServidor)
    return {
      publicKey, 
      privateKey
    } 
}
 
//let publickeyServidor: JWK => {
  //myAsynFunction();
//}

//https://github.com/panva/jose/blob/main/docs/functions/key_generate_key_pair.generateKeyPair.md

myAsynFunction();//Generamos las keys

let user1 = new Usuario('Dani', '1234')



//var value = parseFloat((<HTMLInputElement>document.getElementById("myValue")).value);



//SERVIDOR
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile('chat.html', { root: __dirname });
})

app.get('/index', (req, res) => { 
  res.sendFile('index.html', { root: __dirname });
  }) 

io.on('connection', function(socket: any) {
  socket.data.username = "alice";
  console.log('The user ' + socket.data.username + ' connected');

  socket.on('nuevo mensaje', function(msj: any) {
    io.emit('nuevo mensaje', msj);
    
  });

  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
});




http.listen(3000, function() {
  console.log('listening on 3000'); 
});

/*app.use(cors({
  origin: 'http://localhost:' + port.toString() // angular.js server
}), express.json()) */

app.get('/GOGO', (req, res) => { 
  res.json({
    publickeyServidor,
    privatekeyServidor
  })
})

app.get('/connectedUsers', (req, res) => {
  const sockets = io.fetchSockets();
  var clients = io.sockets.clients;
  console.log(clients); // "alice"

  //console.log(sockets[0].data.username); // "alice"

  res.send(io.engine.clientsCount.toString())
})


app.get('/mensaje', async (req, res) => {
  const { publicKey, privateKey } = await jose.generateKeyPair('RSA-OAEP') //USAR RS256 SI NO NOS ACLARAMOS

  const publicJwk = await jose.exportJWK(publicKey)

  jose.exportJWK(publicKey)

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