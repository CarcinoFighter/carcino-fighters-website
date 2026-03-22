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
    return { endpoint, status: res.status, data: res.data };
  } catch (err) {
    return { endpoint, error: err.message };
  }
}

async function run() {
  const results = [];
  results.push(await testEndpoint('/api/blogs?status=published'));
  results.push(await testEndpoint('/api/survivor-stories?status=published'));
  results.push(await testEndpoint('/api/cancer-docs?status=published'));

  fs.writeFileSync(path.join(__dirname, 'test-results-full.json'), JSON.stringify(results, null, 2));
  console.log('Results written to tmp/test-results-full.json');
}

run();
