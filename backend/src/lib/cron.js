const cron = require('node-cron');
const { fireDueReminders, completePassedEvents } = require('../services/reminderService');

function startCronJobs() {
  // Every 60s: fire due reminders
  cron.schedule('* * * * *', async () => {
    try {
      const fired = await fireDueReminders();
      if (fired > 0) console.log(`[cron] Fired ${fired} reminder(s)`);
    } catch (err) {
      console.error('[cron] fireDueReminders failed:', err.message);
    }
  });

  // Nightly 00:05: sweep Active events past their date to Completed
  cron.schedule('5 0 * * *', async () => {
    try {
      const completed = await completePassedEvents();
      if (completed > 0) console.log(`[cron] Completed ${completed} past event(s)`);
    } catch (err) {
      console.error('[cron] completePassedEvents failed:', err.message);
    }
  });
}

module.exports = { startCronJobs };
