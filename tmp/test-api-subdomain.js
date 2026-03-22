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

const KEY = env.CARCINO_WORK_API_KEY;

async function testEndpoint(baseUrl, endpoint) {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Accept": "application/json"
    }
  });

  try {
    const res = await instance.get(endpoint);
    return { baseUrl, endpoint, status: res.status, data: typeof res.data === 'string' ? (res.data.slice(0, 100) + '...') : res.data, isHtml: typeof res.data === 'string' && res.data.includes('<html'), pass: true };
  } catch (err) {
    if (err.response) {
      return { baseUrl, endpoint, status: err.response.status, data: err.response.data, pass: false };
    } else {
      return { baseUrl, endpoint, error: err.message, pass: false };
    }
  }
}

async function run() {
  const results = [];
  const bases = ['https://api.carcino.work', 'https://www.carcino.work'];
  
  for (const base of bases) {
    results.push(await testEndpoint(base, '/api/content/blogs'));
    results.push(await testEndpoint(base, '/api/blogs'));
  }

  fs.writeFileSync(path.join(__dirname, 'test-results-api-subdomain.json'), JSON.stringify(results, null, 2));
  console.log('Results written to tmp/test-results-api-subdomain.json');
}

run();
