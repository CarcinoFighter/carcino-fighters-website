import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: u, error: uErr } = await supabase.from('users').select('id, email').limit(5);
    const { data: p, error: pErr } = await supabase.from('users_public').select('id, email').limit(5);
    console.log('Users:', u);
    console.log('Public Users:', p);
}

check();
