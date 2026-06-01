import app from './src/app';
import { startCronJobs } from './src/lib/cron';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
  void import('./src/lib/prisma');
  startCronJobs();
});
