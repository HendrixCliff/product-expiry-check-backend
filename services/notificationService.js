const webPush = require('web-push');
require('dotenv').config({ path: './config.env' });

webPush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);


const sendPushNotification = async (subscription, medName, expiryDate, quantity) => {
  const formattedDate = new Date(expiryDate).toDateString();

  const payload = JSON.stringify({
    title: `⏰ ${medName} Expiry Soon`,
    body: `Expires on ${formattedDate} • Quantity: ${quantity}`,
  });

  try {
    await webPush.sendNotification(subscription, payload);
  } catch (error) {
    console.error('Push error:', error.message);
  }
};

module.exports = { sendPushNotification };
