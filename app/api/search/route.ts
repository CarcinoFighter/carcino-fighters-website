import { NextResponse } from 'next/server';
import { getAllDocs } from '@/lib/docsRepository';
import { getAllBlogs } from '@/lib/blogsRepository';
import { supabase } from '@/lib/initSupabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // 1. Fetch articles from docsRepository
    const articles = await getAllDocs();
    const matchedArticles = articles
      .filter(
        (art) =>
          art.title.toLowerCase().includes(query) ||
          (art.content && art.content.toLowerCase().includes(query)) ||
          (art.author && art.author.toLowerCase().includes(query))
      )
      .map((art) => ({
        id: art.id,
        title: art.title,
        type: 'article',
        href: `/article/${art.slug}`,
        author: art.author || 'The Carcino Foundation',
        date: art.created_at || art.updated_at,
        snippet: art.content
          ? art.content.substring(0, 150).replace(/[#*`\n]/g, ' ') + '...'
          : '',
      }));

    // 2. Fetch blogs from blogsRepository
    const blogs = await getAllBlogs();
    const matchedBlogs = blogs
      .filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          (blog.content && blog.content.toLowerCase().includes(query)) ||
          (blog.authorName && blog.authorName.toLowerCase().includes(query))
      )
      .map((blog) => ({
        id: blog.id,
        title: blog.title,
        type: 'blog',
        href: `/blogs/${blog.slug}`,
        author: blog.authorName || 'Community Contributor',
        date: blog.created_at,
        snippet: blog.content
          ? blog.content.substring(0, 150).replace(/[#*`\n]/g, ' ') + '...'
          : '',
      }));

    // 3. Fetch survivor stories from supabase
    let matchedStories: any[] = [];
    try {
      const { data: stories } = await supabase
        .from('survivor_stories')
        .select('id, name, slug, story, diagnosis, age_at_diagnosis, created_at')
        .eq('hidden', false);

      if (stories) {
        matchedStories = stories
          .filter(
            (story) =>
              story.name.toLowerCase().includes(query) ||
              (story.story && story.story.toLowerCase().includes(query)) ||
              (story.diagnosis && story.diagnosis.toLowerCase().includes(query))
          )
          .map((story) => ({
            id: story.id,
            title: `${story.name}'s Story (${story.diagnosis})`,
            type: 'survivor',
            href: `/survivorstories/${story.slug}`,
            author: story.name,
            date: story.created_at,
            snippet: story.story
              ? story.story.substring(0, 150).replace(/[#*`\n]/g, ' ') + '...'
              : '',
          }));
      }
    } catch (storyErr) {
      console.error('Error matching survivor stories:', storyErr);
    }

    const allResults = [...matchedArticles, ...matchedBlogs, ...matchedStories];

    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
  }
}
