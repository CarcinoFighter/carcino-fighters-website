
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpycprmvcnmfuqsoecvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweWNwcm12Y25tZnVxc29lY3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY3NDU3NCwiZXhwIjoyMDY0MjUwNTc0fQ.L_BiIe8qvxikf2kDBRW8XcxqSI2DAX3P-x0CbAXGzQA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogs() {
    const { data, error } = await supabase
        .from('blogs')
        .select('id, title, deleted');
    
    if (error) {
        console.error('Error fetching blogs:', error);
        return;
    }
    
    console.log('Total blogs:', data.length);
    data.forEach(blog => {
        console.log(`ID: ${blog.id}, Title: ${blog.title}, Deleted: ${blog.deleted} (${typeof blog.deleted})`);
    });

    const { data: publicBlogs, error: publicError } = await supabase
        .from('blogs')
        .select('id, title, deleted')
        .eq('deleted', false);
    
    if (publicError) {
        console.error('Error fetching public blogs:', publicError);
        return;
    }
    console.log('Public blogs (deleted=false):', publicBlogs.length);
}

checkBlogs();
