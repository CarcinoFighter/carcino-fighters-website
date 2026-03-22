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

async function testMe() {
  const instance = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Accept": "application/json"
    }
  });

  try {
    const res = await instance.get('/api/users/me');
    console.log(`Status: ${res.status}`);
    console.log(`Data:`, JSON.stringify(res.data));
  } catch (err) {
    if (err.response) {
      console.log(`Status: ${err.response.status}`);
      console.log(`Data:`, JSON.stringify(err.response.data));
    } else {
      console.log(`Error: ${err.message}`);
    }
  }
}

testMe();
