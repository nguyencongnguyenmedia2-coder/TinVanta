const fs = require('fs');

// 1. Process 01_initial_schema.sql
let schema = fs.readFileSync('supabase/migrations/01_initial_schema.sql', 'utf8');
schema = schema.replace(/CREATE TRIGGER\s+(\w+)\s+([A-Z\s]+)\s+ON\s+([a-zA-Z0-9_\.]+)/gi, (match, trgName, timing, tableName) => {
  return `DROP TRIGGER IF EXISTS ${trgName} ON ${tableName};\n${match}`;
});
fs.writeFileSync('supabase/migrations/01_initial_schema.sql', schema, 'utf8');

// 2. Process 02_rls_policies.sql
let rls = fs.readFileSync('supabase/migrations/02_rls_policies.sql', 'utf8');
rls = rls.replace(/CREATE POLICY\s+("[^"]+")\s+ON\s+([a-zA-Z0-9_\.]+)/gi, (match, polName, tableName) => {
  return `DROP POLICY IF EXISTS ${polName.trim()} ON ${tableName.trim()};\n${match}`;
});
fs.writeFileSync('supabase/migrations/02_rls_policies.sql', rls, 'utf8');

// 3. Rebuild SETUP_DATABASE.sql
const seed = fs.readFileSync('supabase/migrations/03_seed_data.sql', 'utf8');
const combined = schema + '\n\n' + rls + '\n\n' + seed;
fs.writeFileSync('supabase/SETUP_DATABASE.sql', combined, 'utf8');
console.log('Successfully made all SQL idempotent!');
