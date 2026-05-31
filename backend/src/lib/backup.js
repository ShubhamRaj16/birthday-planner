const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const backupDir = path.join(__dirname, '../../backup');
  const outputPath = path.join(backupDir, `birthday-planner-${timestamp}.zip`);

  fs.mkdirSync(backupDir, { recursive: true });

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);

    const dbPath = path.join(__dirname, '../../prisma/birthday.db');
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'birthday.db' });
    }

    const uploadsPath = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }

    archive.finalize();
  });

  const bytes = fs.statSync(outputPath).size;
  const kb = Math.round(bytes / 1024);
  console.log(`Backup created: ${outputPath} (${kb} KB)`);
}

runBackup().catch((err) => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
