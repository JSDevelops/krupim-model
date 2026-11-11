const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:yEVYKGRsyllLrUuKqVmIitizIJBvgiCb@sakura.proxy.rlwy.net:50758/railway';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const BACKUP_DIR = path.resolve(__dirname, '../backups');

function sanitizeSqlVal(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (Buffer.isBuffer(val)) {
      return `decode('${val.toString('hex')}', 'hex')`;
    }
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'::timestamptz`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const sqlFile = path.join(BACKUP_DIR, `backup_railway_production_${timestamp}.sql`);
  const jsonFile = path.join(BACKUP_DIR, `backup_railway_production_${timestamp}.json`);

  console.log(`Starting backup of database...`);
  const client = await pool.connect();

  try {
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tableRes.rows.map(r => r.table_name);
    console.log(`Found ${tableNames.length} tables to backup.`);

    const fullDump = {};
    let sqlContent = `-- ==================================================================\n`;
    sqlContent += `-- FINE Model AR+AI Database Full Backup\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Source: Railway PostgreSQL\n`;
    sqlContent += `-- Total Tables: ${tableNames.length}\n`;
    sqlContent += `-- ==================================================================\n\n`;
    sqlContent += `SET client_encoding = 'UTF8';\n`;
    sqlContent += `SET standard_conforming_strings = on;\n\n`;

    for (const table of tableNames) {
      console.log(`Exporting table: ${table}...`);
      const rowsRes = await client.query(`SELECT * FROM "${table}";`);
      fullDump[table] = rowsRes.rows;

      sqlContent += `-- Table: ${table} (${rowsRes.rows.length} rows)\n`;
      if (rowsRes.rows.length > 0) {
        const columns = Object.keys(rowsRes.rows[0]);
        const colList = columns.map(c => `"${c}"`).join(', ');

        for (const row of rowsRes.rows) {
          const valList = columns.map(col => sanitizeSqlVal(row[col])).join(', ');
          sqlContent += `INSERT INTO "${table}" (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;\n`;
        }
      } else {
        sqlContent += `-- (No rows)\n`;
      }
      sqlContent += `\n`;
    }

    fs.writeFileSync(sqlFile, sqlContent, 'utf8');
    fs.writeFileSync(jsonFile, JSON.stringify(fullDump, null, 2), 'utf8');

    const sqlStat = fs.statSync(sqlFile);
    const jsonStat = fs.statSync(jsonFile);

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`SQL File: ${sqlFile} (${(sqlStat.size / 1024).toFixed(1)} KB)`);
    console.log(`JSON File: ${jsonFile} (${(jsonStat.size / 1024).toFixed(1)} KB)`);
  } finally {
    client.release();
    await pool.end();
  }
}

runBackup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});

