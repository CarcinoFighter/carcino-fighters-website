import { getDocBySlugWithAvatar } from './lib/docsRepository.js';

async function verify() {
    console.log('Fetching co-authored article: Eye Cancer...');
    const article = await getDocBySlugWithAvatar('eye-cancer');

    if (!article) {
        console.error('Failed to fetch article');
        return;
    }

    console.log('Article Title:', article.title);
    console.log('Main Author:', article.author);
    console.log('Authors Array Length:', article.authors?.length);

    if (article.authors) {
        article.authors.forEach((author, idx) => {
            console.log(`Author ${idx + 1}:`);
            console.log(`  Name: ${author.name}`);
            console.log(`  Position: ${author.position}`);
            console.log(`  Description: ${author.description.substring(0, 50)}...`);
            console.log(`  PFP: ${author.profilePicture}`);
        });
    } else {
        console.log('No authors array found');
    }
}

verify();
