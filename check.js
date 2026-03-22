const KEY = 'a202bf42c9245476c56253b249cdd03c1825af1fcf703fd1404557b8a8768d9e';
const BASE = 'https://carcino.work';

async function check(path) {
  try {
    const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${KEY}` } });
    const text = await res.text();
    console.log(path, res.status, text.length, text.substring(0, 50).replace(/\n/g, ' '));
  } catch(e) {
    console.log(path, e.message);
  }
}

async function run() {
  await check('/api/content/cancer-docs');
  await check('/api/content/blogs');
  await check('/api/content/blog-posts');
  await check('/api/content/survivor-stories');
  await check('/api/content/survivors-stories');
  await check('/api/content/survivor-story');
  await check('/api/content/stories');
}

run();
