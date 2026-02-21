import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: q, error: qErr } = await supabase.from('users').select('*').eq('email', 'coo@carcino.work');
    console.log('Query:', q);

    // fetch recent upload logs
    const fs = await import('fs');
    const logs = fs.readFileSync('upload-debug.log', 'utf8');
    console.log(logs.slice(-1000));
}

check();
