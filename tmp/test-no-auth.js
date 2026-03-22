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

async function testNoAuth() {
  const instance = axios.create({
    baseURL: BASE,
    headers: {
      "Accept": "application/json"
    }
  });

  try {
    const res = await instance.get('/api/content/blogs');
    console.log(`NoAuth - Blogs - Status: ${res.status}`);
  } catch (err) {
    if (err.response) {
      console.log(`NoAuth - Blogs - Status: ${err.response.status} - Data: ${JSON.stringify(err.response.data)}`);
    } else {
      console.log(`NoAuth - Blogs - Error: ${err.message}`);
    }
  }
}

testNoAuth();
