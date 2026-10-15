const fs = require('fs');

function cleanFile(filePath, isRls) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (!isRls) {
    // Remove existing DROP TRIGGER
    content = content.replace(/DROP TRIGGER IF EXISTS[^\n]+\n/gi, '');
    // Insert single DROP TRIGGER before CREATE TRIGGER
    content = content.replace(/CREATE TRIGGER\s+(\w+)\s+([A-Z\s]+)\s+ON\s+([a-zA-Z0-9_\.]+)/gi, (match, trgName, timing, tableName) => {
      return `DROP TRIGGER IF EXISTS ${trgName} ON ${tableName};\n${match}`;
    });
  } else {
    // Remove existing DROP POLICY
    content = content.replace(/DROP POLICY IF EXISTS[^\n]+\n/gi, '');
    // Insert single DROP POLICY before CREATE POLICY
    content = content.replace(/CREATE POLICY\s+("[^"]+")\s+ON\s+([a-zA-Z0-9_\.]+)/gi, (match, polName, tableName) => {
      return `DROP POLICY IF EXISTS ${polName.trim()} ON ${tableName.trim()};\n${match}`;
    });
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

cleanFile('supabase/migrations/01_initial_schema.sql', false);
cleanFile('supabase/migrations/02_rls_policies.sql', true);

const s1 = fs.readFileSync('supabase/migrations/01_initial_schema.sql', 'utf8');
const s2 = fs.readFileSync('supabase/migrations/02_rls_policies.sql', 'utf8');
const s3 = fs.readFileSync('supabase/migrations/03_seed_data.sql', 'utf8');

const combined = s1 + '\n\n' + s2 + '\n\n' + s3;
fs.writeFileSync('supabase/SETUP_DATABASE.sql', combined, 'utf8');
console.log('Cleaned and rebuilt SETUP_DATABASE.sql perfectly!');
