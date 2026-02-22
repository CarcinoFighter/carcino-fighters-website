import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
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