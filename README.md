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
- **Tailwind CSS:** Utility-first approach for rapid, maintainable UI development
- **Custom N-gram Model:** Trigram-based language model trained on literary and encyclopedic corpora
- **File System Access API:** Direct filesystem interaction without upload/download friction

## Prediction System
- **Training Data:** 10 books from Project Gutenberg
- **Model Architecture:** Fourgram model with fallbacks (fourgram → trigram → bigram → unigram)
- **Build Process:** Custom script to generate models before website launch
- **Data Structures:** Efficient TypeScript interfaces (`NGramModel`, `NGramEntry`) for fast lookup

## Architecture
- **Component-Based:** Modular React components with clear separation of concerns
- **Custom Hooks:** `useFileOperations` and `useFileTrees` hooks abstract complex state management
- **Dynamic Imports:** Code-splitting for Quill.js to optimize initial load time
- **Type-Safe:** Comprehensive TypeScript interfaces for file system operations and editor state

## File Management
- Open individual files or entire folders
- Nested folder navigation with expand/collapse functionality
- Visual indicators for active files and loading states
- Close individual files with persistent state

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

Open [http://localhost:3000](http://localhost:3000) to use the editor.

## Project Structure
```
stride-editor/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── custom-quill.css   # Custom quill styles and theme variables
│   │   ├── globals.css        # Global styles and theme variables
│   │   ├── layout.tsx         # Root layout component
│   │   ├── page.tsx           # Main editor page
│   │   └── not-found.tsx      # 404 page
│   ├── components/            # React components
│   │   ├── editor/           # Editor components
│   │   ├── layout/           # Layout components
│   │   ├── sidebar/          # Sidebar navigation
│   │   ├── theme/            # Theme toggle
│   │   └── ui/               # Reusable UI (Button, Input, Label)
│   ├── hooks/                # Custom React hooks
│   │   ├── useFileOperations.ts  # File system operations
│   │   └── useFileTrees.ts       # File tree state management
│   ├── lib/                  # Utility functions
│   │   ├── fileSystemUtils.ts    # File system helpers
│   │   ├── fileTreeUtils.ts      # Tree manipulation utilities
│   │   ├── nGramModel.tsx        # N-gram prediction logic
│   │   └── predictText.tsx       # Text prediction engine
│   ├── types/                # TypeScript definitions
│   │   └── fileSystem.ts         # File system type interfaces
│   └── scripts/              # Build scripts
│       └── buildModels.ts        # N-gram model training script
├── public/                   # Static assets
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Development Process

This project was developed as a learning exercise to explore:
- Natural language processing fundamentals (n-gram models, tokenization)
- Modern web development patterns (React hooks, TypeScript, component architecture)
- Browser APIs (File System Access, LocalStorage)
- Performance optimization (code splitting, efficient data structures)
- UI/UX design principles (responsive layout, accessibility, user feedback)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
