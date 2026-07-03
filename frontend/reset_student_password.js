const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zzkgzbdvyeansjxsylgw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2d6YmR2eWVhbnNqeHN5bGd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU4NTM3MiwiZXhwIjoyMDk4MTYxMzcyfQ.U2be-lRsbmoEQpmhjlrslx-PeNVwHlpCtsQDooJqy0k';

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
