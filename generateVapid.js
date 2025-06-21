const webPush = require('web-push');

const keys = webPush.generateVAPIDKeys();

console.log('👉 VAPID Public Key:\n', keys.publicKey);
console.log('👉 VAPID Private Key:\n', keys.privateKey);
