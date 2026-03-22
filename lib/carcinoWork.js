import { supabase } from '@/lib/initSupabase';
import { getAvatarUrls } from '@/lib/avatarService';
import axios from 'axios';

const BASE = process.env.CARCINO_WORK_URL;
const KEY = process.env.CARCINO_WORK_API_KEY;

// Debug log for environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log(`[carcinoWork] BASE: ${BASE ? 'OK (' + BASE + ')' : 'MISSING'}`);
  console.log(`[carcinoWork] KEY: ${KEY ? 'OK (ends with ' + KEY.slice(-4) + ')' : 'MISSING'}`);
}

const instance = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${KEY}`,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json"
  }
});

async function safeFetch(url) {
  const fullUrl = url.startsWith('http') ? url : `${BASE}${url}`;
  
  if (!fullUrl.startsWith('http')) {
    console.error(`[carcinoWork] Invalid URL: ${fullUrl}`);
    return null;
  }

  try {
    const res = await instance.get(fullUrl);
    const json = res.data;

    if (json && Array.isArray(json.data)) return json.data;
    if (json && Array.isArray(json.docs)) return json.docs;
    if (json && Array.isArray(json.blogs)) return json.blogs;
    if (json && Array.isArray(json.stories)) return json.stories;
    if (json && Array.isArray(json.survivor_stories)) return json.survivor_stories;
    if (Array.isArray(json)) return json;
    
    // In search of why Array.isArray(data) might fail in the caller
    if (process.env.NODE_ENV === 'development') {
      console.log(`[carcinoWork] safeFetch for ${fullUrl} returned unexpected structure:`, JSON.stringify(json).slice(0, 200));
    }

    // In case it's a single object (by slug)
    if (json && json.data && typeof json.data === 'object') return json.data;
    if (json && typeof json === 'object') return json;
    return null;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        console.error(`[carcinoWork] Request timed out for ${fullUrl}. This might be a DNS or firewall issue on localhost.`);
      } else if (err.code === 'ECONNREFUSED') {
        console.error(`[carcinoWork] Connection refused for ${fullUrl}. Is the remote server up?`);
      } else if (err.response) {
        if (err.response.status === 500) {
          console.error(`[carcinoWork] External CMS at ${fullUrl} reported a server error (500). Staff content may be temporarily unavailable.`);
        } else {
          const resData = err.response.data;
          const isHtml = typeof resData === 'string' && resData.trim().startsWith('<');
          const preview = isHtml ? '(HTML Response Omitted)' : resData;
          console.error(`[carcinoWork] Fetch failed for ${fullUrl} with status ${err.response.status}:`, preview);
        }
      } else {
        console.error(`[carcinoWork] Fetch error for ${fullUrl}:`, err.message);
      }
    } else {
      console.error(`[carcinoWork] Unexpected error for ${fullUrl}:`, err.message);
    }
    return null;
  }
}


async function fetchLocalAuthors(userIds, table, columns) {
  if (!userIds || userIds.length === 0) return {};
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${columns}`)
    .in('id', userIds);
    
  if (error || !data) {
    console.error(`Failed to fetch local authors from ${table}`, error);
    return {};
  }
  
  const map = {};
  for (const user of data) {
    map[user.id] = user;
  }
  return map;
}

export async function getStaffBlogs() {
  const data = await safeFetch(`${BASE}/api/content/blogs`);
  if (!Array.isArray(data)) {
    console.log(`[carcinoWork] getStaffBlogs: No data returned`);
    return [];
  }
  
  console.log(`[carcinoWork] getStaffBlogs: Found ${data.length} blogs`);
  
  const userIds = [...new Set(data.map(b => b.user_id).filter(Boolean))];
  const authorMap = await fetchLocalAuthors(userIds, 'users_public', 'name, username, avatar_url, bio');

  return data.map(row => {
    const author = authorMap[row.user_id] || row.users_public || row.users || {};
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      tags: row.tags,
      views: row.views,
      likes: row.likes,
      created_at: row.created_at || row.published_at || new Date().toISOString(),
      updated_at: row.updated_at,
      hidden: row.hidden,
      authorName: row.authorName || author.name || author.username || "Carcino Foundation Staff",
      authorUsername: row.authorUsername || author.username || null,
      authorBio: row.authorBio || author.bio || author.description || null,
      avatarUrl: row.avatarUrl || author.avatar_url || null,
      source: 'staff'
    };
  });
}

export async function getStaffBlogBySlug(slug) {
  const row = await safeFetch(`${BASE}/api/content/blogs/${slug}`);
  if (!row) return null;
  
  const authorMap = await fetchLocalAuthors(row.user_id ? [row.user_id] : [], 'users_public', 'name, username, avatar_url, bio');
  const author = authorMap[row.user_id] || row.users_public || row.users || {};
  
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    tags: row.tags,
    views: row.views,
    likes: row.likes,
    created_at: row.created_at || row.published_at || new Date().toISOString(),
    updated_at: row.updated_at,
    hidden: row.hidden,
    authorName: row.authorName || author.name || author.username || "Carcino Foundation Staff",
    authorUsername: row.authorUsername || author.username || null,
    authorBio: row.authorBio || author.bio || author.description || null,
    avatarUrl: row.avatarUrl || author.avatar_url || null,
    source: 'staff'
  };
}

export async function getStaffSurvivorStories() {
  const data = await safeFetch(`${BASE}/api/content/survivor-stories`);
  if (!Array.isArray(data)) {
    console.log(`[carcinoWork] getStaffSurvivorStories: No data returned`);
    return [];
  }
  
  console.log(`[carcinoWork] getStaffSurvivorStories: Found ${data.length} stories`);
  
  const userIds = [...new Set(data.map(s => s.user_id).filter(Boolean))];
  const authorMap = await fetchLocalAuthors(userIds, 'users', 'name, username, avatar_url, description');

  return data.map(row => {
    const author = authorMap[row.user_id] || row.users_public || row.users || {};
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      image_url: row.image_url || null,
      colour: row.colour || null,
      tags: row.tags,
      views: row.views,
      likes: row.likes,
      created_at: row.created_at || row.published_at || new Date().toISOString(),
      updated_at: row.updated_at,
      deleted: row.deleted,
      authorName: row.authorName || author.name || author.username || "Carcino Foundation Staff",
      authorUsername: row.authorUsername || author.username || null,
      authorBio: row.authorBio || author.description || author.bio || null,
      avatarUrl: row.avatarUrl || author.avatar_url || null,
      source: 'staff'
    };
  });
}

export async function getStaffSurvivorStoryBySlug(slug) {
  const row = await safeFetch(`${BASE}/api/content/survivor-stories/${slug}`);
  if (!row) return null;
  
  const authorMap = await fetchLocalAuthors(row.user_id ? [row.user_id] : [], 'users', 'name, username, avatar_url, description');
  const author = authorMap[row.user_id] || row.users_public || row.users || {};
  
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    image_url: row.image_url || null,
    colour: row.colour || null,
    tags: row.tags,
    views: row.views,
    likes: row.likes,
    created_at: row.created_at || row.published_at || new Date().toISOString(),
    updated_at: row.updated_at,
    deleted: row.deleted,
    authorName: row.authorName || author.name || author.username || "Carcino Foundation Staff",
    authorUsername: row.authorUsername || author.username || null,
    authorBio: row.authorBio || author.description || author.bio || null,
    avatarUrl: row.avatarUrl || author.avatar_url || null,
    source: 'staff'
  };
}

export async function getStaffCancerDocs() {
  const data = await safeFetch(`${BASE}/api/content/cancer-docs`);
  if (!Array.isArray(data)) {
    console.log(`[carcinoWork] getStaffCancerDocs: No data returned`);
    return [];
  }
  
  console.log(`[carcinoWork] getStaffCancerDocs: Found ${data.length} cancer docs`);
  
  const userIdsSet = new Set();
  const namesSet = new Set();

  data.forEach(d => {
    if (d.author_user_ids && d.author_user_ids.length > 0) {
      d.author_user_ids.forEach(id => userIdsSet.add(id));
    } else if (d.author_user_id) {
      userIdsSet.add(d.author_user_id);
    }
    let aStr = d.author;
    if (aStr && typeof aStr === 'object') aStr = aStr.name || aStr.username;
    if (typeof aStr === 'string' && aStr) {
      aStr.split(/ and |,/i).forEach(n => namesSet.add(n.trim()));
    }
  });

  const userIds = Array.from(userIdsSet);
  const authorMap = await fetchLocalAuthors(userIds, 'users', 'name, username, email, position, description, avatar_url');

  const names = Array.from(namesSet).filter(Boolean);
  const allIdsForAvatars = new Set(userIds);

  if (names.length > 0) {
    const { data: nameRows } = await supabase.from('users').select('id, name, username, email, position, description, avatar_url').in('name', names);
    if (nameRows) {
      nameRows.forEach(u => { authorMap[u.name] = u; allIdsForAvatars.add(u.id); });
    }
    const { data: userRows } = await supabase.from('users').select('id, name, username, email, position, description, avatar_url').in('username', names);
    if (userRows) {
      userRows.forEach(u => { authorMap[u.username] = u; allIdsForAvatars.add(u.id); });
    }
  }

  let picMap = {};
  if (allIdsForAvatars.size > 0) {
    try {
      picMap = await getAvatarUrls(Array.from(allIdsForAvatars));
    } catch(e) {
      console.warn('Avatars fetch error', e);
    }
  }

  return data.map(row => {
    const idsToUse = row.author_user_ids && row.author_user_ids.length > 0 ? row.author_user_ids : (row.author_user_id ? [row.author_user_id] : []);
    let metas = idsToUse.map(id => authorMap[id]).filter(Boolean);
    
    let authorNamesStr = row.author;
    if (authorNamesStr && typeof authorNamesStr === 'object') {
      authorNamesStr = authorNamesStr.name || authorNamesStr.username || "Unknown";
    }

    if (metas.length === 0 && typeof authorNamesStr === 'string' && authorNamesStr) {
      const parts = authorNamesStr.split(/ and |,/i).map(n => n.trim()).filter(Boolean);
      metas = parts.map(p => authorMap[p]).filter(Boolean);
    }
    let position = row.position;
    let authorDescription = row.authorDescription;
    
    if (metas.length > 0) {
      const authorNames = metas.map(meta => meta.name || meta.username || meta.email || "Unknown");
      authorNamesStr = authorNames.join(" and ");
      position = metas[0].position || null;
      authorDescription = metas[0].description || null;
    } else {
      const extAuthor = row.users_public || row.users || {};
      authorNamesStr = authorNamesStr || extAuthor.name || extAuthor.username || "Carcino Foundation Staff";
      position = position || extAuthor.position || null;
      authorDescription = authorDescription || extAuthor.description || null;
    }
    
    const primaryAuthorId = idsToUse[0] || row.id; // fallbacks to row.id if somehow we match ids like docsRepository
    const profilePicture = picMap[primaryAuthorId] || row.profilePicture || row.avatar_url || null;

    const authorsArray = metas.length > 0 ? metas.map(meta => ({
      name: meta.name || meta.username || meta.email || "Unknown Author",
      position: meta.position || "Researcher",
      description: meta.description || "Researcher at The Carcino Foundation.",
      profilePicture: picMap[meta.id] || meta.avatar_url || null
    })) : [{
      name: authorNamesStr,
      position: position || "Researcher",
      description: authorDescription || "Researcher at The Carcino Foundation.",
      profilePicture: profilePicture
    }];

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      content: row.content,
      author_user_id: row.author_user_id || null,
      author_user_ids: row.author_user_ids || [],
      color: row.color || null,
      author: authorNamesStr,
      position: position,
      authorDescription: authorDescription,
      profilePicture: profilePicture,
      authors: authorsArray,
      source: 'staff'
    };
  });
}

export async function getStaffCancerDocBySlug(slug) {
  const docs = await getStaffCancerDocs();
  return docs.find(d => d.slug === slug) || null;
}
