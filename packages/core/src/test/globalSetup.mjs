import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function setup() {
  const backendDir = path.join(__dirname, '../..');
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    cwd: backendDir,
    stdio: 'inherit',
  });
}
