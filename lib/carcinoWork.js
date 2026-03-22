import { supabase } from '@/lib/initSupabase';
import { getAvatarUrls } from '@/lib/avatarService';

const BASE = process.env.CARCINO_WORK_URL
const KEY = process.env.CARCINO_WORK_API_KEY

const headers = {
  Authorization: `Bearer ${KEY}`,
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/json"
}

async function safeFetch(url) {
  try {
    const res = await fetch(url, { headers, next: { revalidate: 60 }, signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      console.error(`Fetch failed for ${url} with status ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (json && Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    // In case it's a single object (by slug)
    if (json && json.data && typeof json.data === 'object') return json.data;
    if (json && typeof json === 'object') return json;
    return null;
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err.message);
    if (err.cause) console.error("Caused by:", err.cause);
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
  if (!Array.isArray(data)) return [];
  
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
  if (!Array.isArray(data)) return [];
  
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
  if (!Array.isArray(data)) return [];
  
  const userIdsSet = new Set();
  data.forEach(d => {
    if (d.author_user_ids && d.author_user_ids.length > 0) d.author_user_ids.forEach(id => userIdsSet.add(id));
    else if (d.author_user_id) userIdsSet.add(d.author_user_id);
  });
  const userIds = Array.from(userIdsSet);
  const authorMap = await fetchLocalAuthors(userIds, 'users', 'name, username, email, position, description, avatar_url');
  
  let picMap = {};
  if (userIds.length > 0) {
    try {
      picMap = await getAvatarUrls(userIds);
    } catch(e) {
      console.warn('Avatars fetch error', e);
    }
  }

  return data.map(row => {
    const idsToUse = row.author_user_ids && row.author_user_ids.length > 0 ? row.author_user_ids : (row.author_user_id ? [row.author_user_id] : []);
    const metas = idsToUse.map(id => authorMap[id]).filter(Boolean);
    
    let authorNamesStr = row.author;
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
      source: 'staff'
    };
  });
}

export async function getStaffCancerDocBySlug(slug) {
  const row = await safeFetch(`${BASE}/api/content/cancer-docs/${slug}`);
  if (!row) return null;
  
  const idsToUse = row.author_user_ids && row.author_user_ids.length > 0 ? row.author_user_ids : (row.author_user_id ? [row.author_user_id] : []);
  const authorMap = await fetchLocalAuthors(idsToUse, 'users', 'name, username, email, position, description, avatar_url');
  
  let picMap = {};
  if (idsToUse.length > 0) {
    try {
      picMap = await getAvatarUrls(idsToUse);
    } catch(e) {
      console.warn('Avatars fetch error', e);
    }
  }

  const metas = idsToUse.map(id => authorMap[id]).filter(Boolean);
  
  let authorNamesStr = row.author;
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
  
  const primaryAuthorId = idsToUse[0] || row.id;
  const profilePicture = picMap[primaryAuthorId] || row.profilePicture || row.avatar_url || null;

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
    source: 'staff'
  };
}
