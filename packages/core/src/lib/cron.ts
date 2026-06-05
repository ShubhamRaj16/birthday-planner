import cron from 'node-cron';
import { fireDueReminders, completePassedEvents } from '../services/reminderService';

export function startCronJobs(): void {
  // Every 60s: fire due reminders
  cron.schedule('* * * * *', async () => {
    try {
      const fired = await fireDueReminders();
      if (fired > 0) console.log(`[cron] Fired ${fired} reminder(s)`);
    } catch (err) {
      console.error('[cron] fireDueReminders failed:', (err as Error).message);
    }
  });

  // Nightly 00:05: sweep Active events past their date to Completed
  cron.schedule('5 0 * * *', async () => {
    try {
      const completed = await completePassedEvents();
      if (completed > 0) console.log(`[cron] Completed ${completed} past event(s)`);
    } catch (err) {
      console.error('[cron] completePassedEvents failed:', (err as Error).message);
    }
  });
}
