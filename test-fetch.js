// Node 18+ has built-in fetch


const BASE = "https://carcino.work";
const KEY = "a202bf42c9245476c56253b249cdd03c1825af1fcf703fd1404557b8a8768d9e";

const headers = {
  Authorization: `Bearer ${KEY}`,
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/json"
}

async function testFetch() {
  const url = `${BASE}/api/content/blogs`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, { headers });
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const json = await res.json();
      console.log(`Success! Found ${Array.isArray(json.data) ? json.data.length : (Array.isArray(json) ? json.length : 'some')} items.`);
    } else {
      const text = await res.text();
      console.log(`Failed: ${text}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.cause) console.error("Cause:", err.cause);
  }
}

testFetch();
