
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpycprmvcnmfuqsoecvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweWNwcm12Y25tZnVxc29lY3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY3NDU3NCwiZXhwIjoyMDY0MjUwNTc0fQ.L_BiIe8qvxikf2kDBRW8XcxqSI2DAX3P-x0CbAXGzQA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching blogs:', error);
        return;
    }
    
    if (data.length === 0) {
        console.log('No blogs found.');
        return;
    }
    
    console.log('Columns in blogs table:', Object.keys(data[0]));
    console.log('Sample Data:', JSON.stringify(data[0], null, 2));

    const { data: countData, error: countErr } = await supabase
        .from('blogs')
        .select('id', { count: 'exact', head: true });
    
    console.log('Total blogs count:', countData ? countData.length : 'N/A', countErr || '');
}

inspectTable();
