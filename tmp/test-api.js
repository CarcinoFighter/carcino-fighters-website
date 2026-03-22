const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Basic .env parser
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

async function test() {
  console.log(`Testing BASE: ${BASE}`);
  console.log(`Testing KEY: ${KEY ? 'PRESENT' : 'MISSING'}`);

  if (!BASE || !KEY) {
    console.error('Missing BASE or KEY in .env');
    return;
  }

  const instance = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Accept": "application/json"
    }
  });

  const endpoints = [
    '/api/content/blogs',
    '/api/content/survivor-stories',
    '/api/content/cancer-docs'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nFetching ${endpoint}...`);
      const res = await instance.get(endpoint);
      console.log(`Success! Status: ${res.status}`);
      // The API seems to return { data: [...] } or { blogs: [...] } etc based on lib/carcinoWork.js
      const data = res.data;
      let count = 0;
      if (Array.isArray(data)) count = data.length;
      else if (data.data && Array.isArray(data.data)) count = data.data.length;
      else if (data.blogs && Array.isArray(data.blogs)) count = data.blogs.length;
      else if (data.docs && Array.isArray(data.docs)) count = data.docs.length;
      else if (data.stories && Array.isArray(data.stories)) count = data.stories.length;
      
      console.log(`Count: ${count}`);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`);
      if (err.response) {
        console.error(`Status: ${err.response.status}`);
        console.error(`Data:`, JSON.stringify(err.response.data));
      } else {
        console.error(err.message);
      }
    }
  }
}

test();
