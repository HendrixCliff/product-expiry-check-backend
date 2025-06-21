const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const { sendEmail } = require('../services/emailService');
const { sendPushNotification } = require('../services/notificationService');

const checkExpiringMedicines = async () => {
  const now = new Date();

  const day30 = new Date();
  day30.setDate(now.getDate() + 30);
  day30.setHours(0, 0, 0, 0);

  const day15 = new Date();
  day15.setDate(now.getDate() + 15);
  day15.setHours(0, 0, 0, 0);

  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);

  const windowEnd = new Date();
  windowEnd.setHours(23, 59, 59, 999);

  const meds = await Medicine.find({
    expiryDate: { $gte: now }
  });

  for (let med of meds) {
    const expiry = new Date(med.expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    // Always send push notifications
    if (med.pushSubscription) {
      await sendPushNotification(med.pushSubscription, med.name, med.expiryDate);
      console.log(`🔔 Push sent for ${med.name}`);
    }

    // 30 days before
    if (diffDays === 30 && !med.emailNotified30) {
      if (med.email) {
        await sendEmail(med.email, med.name, med.expiryDate);
        med.emailNotified30 = true;
        console.log(`📧 Email #1 sent to ${med.email} for ${med.name}`);
      }
    }

    // 15 days before
    if (diffDays === 15 && !med.emailNotified15) {
      if (med.email) {
        await sendEmail(med.email, med.name, med.expiryDate);
        med.emailNotified15 = true;
        console.log(`📧 Email #2 sent to ${med.email} for ${med.name}`);
      }
    }

    await med.save();
  }
};


module.exports.start = () => {
  cron.schedule('0 9,12,15,16,17,18,19,21 * * *', () => {
    console.log('🔔 Running Expiry Check Job...');
    checkExpiringMedicines().catch(err => console.error('❌ Error in cron job:', err));
  });
};
