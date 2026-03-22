const axios = require('axios');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
});

const BASE = env.CARCINO_WORK_URL;
const KEY = env.CARCINO_WORK_API_KEY;

async function testEndpoint(endpoint) {
  const instance = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Accept": "application/json"
    }
  });

  try {
    const res = await instance.get(endpoint);
    // Log the structure of the first item
    let sample = null;
    const data = res.data;
    if (Array.isArray(data)) sample = data[0];
    else if (data.docs && Array.isArray(data.docs)) sample = data.docs[0];
    else if (data.blogs && Array.isArray(data.blogs)) sample = data.blogs[0];
    else if (data.data && Array.isArray(data.data)) sample = data.data[0];
    
    return { endpoint, status: res.status, structure: sample ? Object.keys(sample) : 'no sample', count: Array.isArray(data) ? data.length : (data.docs ? data.docs.length : (data.blogs ? data.blogs.length : 'unknown')) };
  } catch (err) {
    return { endpoint, error: err.message };
  }
}

async function run() {
  const results = [];
  results.push(await testEndpoint('/api/blogs'));
  results.push(await testEndpoint('/api/survivor-stories'));
  results.push(await testEndpoint('/api/cancer-docs'));

  fs.writeFileSync(path.join(__dirname, 'test-results-structure.json'), JSON.stringify(results, null, 2));
  console.log('Results written to tmp/test-results-structure.json');
}

run();
