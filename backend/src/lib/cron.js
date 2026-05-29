const cron = require('node-cron');
const { fireDueReminders, completePassedEvents } = require('../services/reminderService');

function startCronJobs() {
  // Every 60s: fire due reminders
  cron.schedule('* * * * *', async () => {
    const fired = await fireDueReminders();
    if (fired > 0) console.log(`[cron] Fired ${fired} reminder(s)`);
  });

  // Nightly 00:05: sweep Active events past their date to Completed
  cron.schedule('5 0 * * *', async () => {
    const completed = await completePassedEvents();
    if (completed > 0) console.log(`[cron] Completed ${completed} past event(s)`);
  });
}

module.exports = { startCronJobs };
