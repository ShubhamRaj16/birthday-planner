const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
  require('./src/lib/prisma');
  require('./src/lib/cron').startCronJobs();
});
