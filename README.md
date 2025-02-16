# Simple Static Site Generator

A lightweight Node.js-based static site generator that converts Markdown files to HTML pages. Perfect for personal websites with blogs and information pages.

## Features

- Markdown support for content
- Blog with automatic index generation
- Simple templating with EJS
- Live reload during development
- Fast build process
- No complex frameworks

## Project Structure

```
.
├── src/
│   ├── content/         # Markdown content files
│   │   ├── blog/       # Blog posts in Markdown
│   │   └── pages/      # Static pages (About, FAQ, etc.)
│   ├── templates/      # EJS templates
│   └── assets/         # CSS, images, and other static files
├── scripts/            # Build scripts
└── dist/              # Generated static site
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add content:
- Place blog posts as Markdown files in `src/content/blog/`
- Add pages in `src/content/pages/`
- Customize templates in `src/templates/`

3. Development:
```bash
npm run dev
```
This will start a development server at http://localhost:3000 with live reload.

4. Production build:
```bash
npm run build
```
The generated site will be in the `dist/` directory.

## Adding Content

### Blog Posts

Create a new `.md` file in `src/content/blog/` with front matter:

```markdown
---
title: My Blog Post
date: 2024-03-20
author: Your Name
description: A brief description of the post
---

Your content here...
```

### Pages

Create a new `.md` file in `src/content/pages/` with front matter:

```markdown
---
title: Page Title
---

Your content here...
```

## Customization

- Edit templates in `src/templates/`
- Modify styles in `src/assets/css/style.css`
- Update site navigation in `src/templates/base.ejs`