const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    '2f71ccb7-d12d-41da-8bd0-2c16db29d7a9',
    { password: 'student1234' }
  );
    
  if (error) {
    console.error('❌ Error updating user password:', error);
    return;
  }
  
  console.log('✅ Successfully updated password to "student1234" for:', data.user.email);
}

main();
