const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const ejs = require('ejs');
const frontMatter = require('front-matter');

const SOURCE_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');

async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

async function copyDir(src, dest) {
    await ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function processMarkdown(content) {
    const { attributes, body } = frontMatter(content);
    const html = marked.parse(body);
    return { attributes, content: html };
}

async function buildPage(filePath, template, outputPath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { attributes, content: html } = await processMarkdown(content);
    
    const templatePath = path.join(SOURCE_DIR, 'templates', template);
    const rendered = await ejs.renderFile(templatePath, {
        content: html,
        title: attributes.title,
        date: attributes.date,
        ...attributes
    });

    await fs.writeFile(outputPath, rendered);
}

async function buildBlog() {
    const blogDir = path.join(SOURCE_DIR, 'content/blog');
    const posts = [];

    try {
        const files = await fs.readdir(blogDir);
        
        for (const file of files) {
            if (!file.endsWith('.md')) continue;

            const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
            const { attributes } = frontMatter(content);
            
            const outputPath = `/blog/${path.basename(file, '.md')}.html`;
            posts.push({
                ...attributes,
                url: outputPath
            });

            await buildPage(
                path.join(blogDir, file),
                'post.ejs',
                path.join(DIST_DIR, outputPath)
            );
        }

        // Sort posts by date
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Build blog index
        const blogIndexPath = path.join(DIST_DIR, 'blog/index.html');
        const rendered = await ejs.renderFile(
            path.join(SOURCE_DIR, 'templates/blog_index.ejs'),
            { posts, title: 'Blog' }
        );
        await fs.writeFile(blogIndexPath, rendered);

    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
}

async function buildPages() {
    const pagesDir = path.join(SOURCE_DIR, 'content/pages');
    
    try {
        const files = await fs.readdir(pagesDir);
        
        for (const file of files) {
            if (!file.endsWith('.md')) continue;

            const outputPath = path.join(
                DIST_DIR,
                file === 'index.md' ? 'index.html' : `${path.basename(file, '.md')}/index.html`
            );
            
            await ensureDir(path.dirname(outputPath));
            await buildPage(
                path.join(pagesDir, file),
                'page.ejs',
                outputPath
            );
        }
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
}

async function build() {
    console.log('🚀 Building site...');
    
    // Ensure dist directory exists
    await ensureDir(DIST_DIR);
    await ensureDir(path.join(DIST_DIR, 'blog'));
    
    // Copy assets
    const assetsDir = path.join(SOURCE_DIR, 'assets');
    try {
        await copyDir(assetsDir, path.join(DIST_DIR, 'assets'));
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
    
    // Build pages and blog
    await Promise.all([
        buildPages(),
        buildBlog()
    ]);
    
    console.log('✨ Build complete!');
}

// Run build if called directly
if (require.main === module) {
    build().catch(console.error);
}

module.exports = build; 