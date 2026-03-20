const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const sb = createClient(url, key);

async function test() {
  console.log("Testing!inner");
  const res1 = await sb.from('blogs').select('id, users_public!inner(name)').limit(1);
  console.log(res1.error || "Success1");

  console.log("Testing !user_id");
  const res2 = await sb.from('blogs').select('id, users_public!user_id(name)').limit(1);
  console.log(res2.error || "Success2");

  console.log("Testing !blogs_user_id_fkey");
  const res3 = await sb.from('blogs').select('id, users_public!blogs_user_id_fkey(name)').limit(1);
  console.log(res3.error || "Success3");
}

test();
