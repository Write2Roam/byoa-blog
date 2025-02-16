const express = require('express');
const chokidar = require('chokidar');
const path = require('path');
const build = require('./build');

const app = express();
const PORT = 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle routes for known pages
app.get(['/about', '/faq', '/blog'], (req, res) => {
    const htmlPath = path.join(__dirname, '../dist', req.path, 'index.html');
    res.sendFile(htmlPath);
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Watch for changes in the src directory
const watcher = chokidar.watch(path.join(__dirname, '../src'), {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

// Add event listeners
watcher
    .on('ready', () => {
        console.log('Initial scan complete. Ready for changes...');
    })
    .on('change', async (path) => {
        console.log(`File ${path} has been changed`);
        try {
            await build();
            console.log('Site rebuilt successfully');
        } catch (err) {
            console.error('Error rebuilding site:', err);
        }
    })
    .on('add', async (path) => {
        console.log(`File ${path} has been added`);
        try {
            await build();
            console.log('Site rebuilt successfully');
        } catch (err) {
            console.error('Error rebuilding site:', err);
        }
    })
    .on('unlink', async (path) => {
        console.log(`File ${path} has been removed`);
        try {
            await build();
            console.log('Site rebuilt successfully');
        } catch (err) {
            console.error('Error rebuilding site:', err);
        }
    });

// Initial build
build().then(() => {
    // Start the server
    app.listen(PORT, () => {
        console.log(`Development server running at http://localhost:${PORT}`);
        console.log('Press Ctrl+C to stop');
    });
}).catch(console.error); 