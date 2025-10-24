# Stride Editor

A text editor with n-gram powered predictive text; it was built to explore word predictions.

**Live Demo:** [Vercel Deployment](https://stride-text-editor.vercel.app/)

## Overview

Stride is a web-based text editor with word prediction powered by n-gram models. The prediction system was trained on  10 books from Project Gutenberg.

The editor interface is inspired by VS Code and features folder navigation, custom fonts, and saving.

## Core Functionality
- **Predictive Text:** Custom fourgram model with trigram, bigram, and unigram fallback strategies
- **Rich Text Editing:** Powered by Quill.js with support for formatting, lists, and code blocks
- **File System Integration:** Native browser File System Access API for seamless local file operations
- **Document Management:** Hierarchical folder structure with collapsible navigation
- **Dark/Light Themes:** Theme switching with custom color palettes
- **Responsive Design:** Functional on desktop, tablet, and mobile devices

## Tech Stack

- **Next.js 14:** App router for efficient routing, optimized builds, simple Vercel deployment
- **TypeScript:** Code reliability
- **Quill.js:** API for text manipulation and cursor management
- **Tailwind CSS:** Simple and maintainable UI development
- **File System Access API:** Filesystem interaction with upload and download

## Prediction System
- **Training Data:** 10 books from Project Gutenberg
- **Model Architecture:** Fourgram model with fallbacks (fourgram → trigram → bigram → unigram)
- **Build Process:** Custom script to generate models before server side

## Installation & Usage
```bash
# Clone the repository
git clone https://github.com/rbessin/Stride-Editor.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure
```
stride-editor/
├── src/
│   ├── app/
│   │   ├── custom-quill.css
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── editor/
│   │   ├── layout/
│   │   ├── sidebar/
│   │   ├── theme/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useFileOperations.ts
│   │   └── useFileTrees.ts
│   ├── lib/
│   │   ├── fileSystemUtils.ts
│   │   ├── fileTreeUtils.ts
│   │   ├── nGramModel.tsx
│   │   └── predictText.tsx
│   ├── types/
│   │   └── fileSystem.ts
│   └── scripts/
│       └── buildModels.ts
├── public/
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
