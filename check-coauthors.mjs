import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hpycprmvcnmfuqsoecvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweWNwcm12Y25tZnVxc29lY3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY3NDU3NCwiZXhwIjoyMDY0MjUwNTc0fQ.L_BiIe8qvxikf2kDBRW8XcxqSI2DAX3P-x0CbAXGzQA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, username, description, avatar_url');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('ALL USERS:');
    users.forEach(user => {
        console.log(`ID: ${user.id} | Name: ${user.name} | Username: ${user.username}`);
    });
}

check();
