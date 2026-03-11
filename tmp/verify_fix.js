
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpycprmvcnmfuqsoecvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweWNwcm12Y25tZnVxc29lY3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY3NDU3NCwiZXhwIjoyMDY0MjUwNTc0fQ.L_BiIe8qvxikf2kDBRW8XcxqSI2DAX3P-x0CbAXGzQA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFix() {
    const { data, error } = await supabase
        .from('blogs')
        .select('id, title, hidden')
        .eq('hidden', false);
    
    if (error) {
        console.error('Error fetching blogs with hidden=false:', error);
        return;
    }
    
    console.log('Public blogs found:', data.length);
    data.forEach(blog => {
        console.log(`- ${blog.title} (ID: ${blog.id})`);
    });

    if (data.length > 0) {
        console.log('SUCCESS: Public blogs are now retrievable using the hidden=false filter.');
    } else {
        console.log('WARNING: No blogs found with hidden=false. Check if any blogs exist in the table.');
    }
}

verifyFix();
