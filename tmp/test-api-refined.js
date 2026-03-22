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
    return `[PASS] ${endpoint} - Status: ${res.status}`;
  } catch (err) {
    if (err.response) {
      return `[FAIL] ${endpoint} - Status: ${err.response.status} - Data: ${JSON.stringify(err.response.data)}`;
    } else {
      return `[ERROR] ${endpoint} - Message: ${err.message}`;
    }
  }
}

async function run() {
  const results = [];
  results.push('--- Testing without status=published ---');
  results.push(await testEndpoint('/api/content/blogs'));
  results.push(await testEndpoint('/api/content/survivor-stories'));
  results.push(await testEndpoint('/api/content/cancer-docs'));

  results.push('\n--- Testing WITH status=published ---');
  results.push(await testEndpoint('/api/content/blogs?status=published'));
  results.push(await testEndpoint('/api/content/survivor-stories?status=published'));
  results.push(await testEndpoint('/api/content/cancer-docs?status=published'));

  console.log(results.join('\n'));
}

run();
