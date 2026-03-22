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
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
  });

  try {
    const res = await instance.get(endpoint);
    return { endpoint, status: res.status, pass: true };
  } catch (err) {
    if (err.response) {
      return { endpoint, status: err.response.status, data: err.response.data, pass: false };
    } else {
      return { endpoint, error: err.message, pass: false };
    }
  }
}

async function run() {
  const results = [];
  results.push(await testEndpoint('/api/content/blogs'));
  results.push(await testEndpoint('/api/content/survivor-stories'));
  results.push(await testEndpoint('/api/content/cancer-docs'));

  fs.writeFileSync(path.join(__dirname, 'test-results-ua.json'), JSON.stringify(results, null, 2));
  console.log('Results written to tmp/test-results-ua.json');
}

run();
