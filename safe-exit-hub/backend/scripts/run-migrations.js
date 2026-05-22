import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../database/migrations');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running ${file}...`);
    await conn.query(sql);
    console.log(`  ✓ ${file}`);
  }

  await conn.end();
  console.log('All migrations complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
