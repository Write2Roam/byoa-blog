const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const frontMatter = require('front-matter');

// Ensure build directory exists
fs.ensureDirSync('dist');

// Copy static assets
fs.copySync('src/static', 'dist', { overwrite: true });

// Read template
const template = fs.readFileSync('src/templates/main.html', 'utf-8');

// Process markdown files
function processMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { attributes, body } = frontMatter(content);
    const html = marked.parse(body);
    
    return template
        .replace('{{title}}', attributes.title || 'My Site')
        .replace('{{content}}', html);
}

// Build pages
function buildPages() {
    const pagesDir = 'src/content/pages';
    const files = fs.readdirSync(pagesDir);
    
    files.forEach(file => {
        if (file.endsWith('.md')) {
            const content = processMarkdown(path.join(pagesDir, file));
            const outputPath = path.join('dist', file.replace('.md', '.html'));
            fs.writeFileSync(outputPath, content);
        }
    });
}

// Build blog posts
function buildBlog() {
    const blogDir = 'src/content/blog';
    const files = fs.readdirSync(blogDir);
    
    const posts = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
            const { attributes, body } = frontMatter(content);
            return {
                slug: file.replace('.md', ''),
                ...attributes,
                content: marked.parse(body)
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate individual blog posts
    posts.forEach(post => {
        const postHtml = template
            .replace('{{title}}', post.title)
            .replace('{{content}}', post.content);
        fs.writeFileSync(`dist/blog/${post.slug}.html`, postHtml);
    });

    // Generate blog index
    const blogIndex = template
        .replace('{{title}}', 'Blog')
        .replace('{{content}}', `
            <h1>Blog Posts</h1>
            ${posts.map(post => `
                <article>
                    <h2><a href="/blog/${post.slug}.html">${post.title}</a></h2>
                    <time>${new Date(post.date).toLocaleDateString()}</time>
                    ${post.excerpt ? `<p>${post.excerpt}</p>` : ''}
                </article>
            `).join('')}
        `);
    fs.writeFileSync('dist/blog/index.html', blogIndex);
}

// Create necessary directories
fs.ensureDirSync('dist/blog');
fs.ensureDirSync('src/content/pages');
fs.ensureDirSync('src/content/blog');
fs.ensureDirSync('src/templates');
fs.ensureDirSync('src/static/css');

// Run build
buildPages();
buildBlog(); 