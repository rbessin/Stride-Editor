# Stride Editor

A modern text editor with AI-powered predictive text, built to explore natural language processing and modern web development practices.

**Developer:** Raphael Bessin, Computer Science @ Northeastern University  
**Live Demo:** [Vercel Deployment](https://stride-text-editor.vercel.app/)

## Overview

Stride is a sophisticated web-based text editor featuring real-time word prediction powered by n-gram language models. The prediction system was trained on  10 books from Project Gutenberg, providing context-aware suggestions as you type.

The editor combines a clean, VS Code-inspired interface with advanced features like folder navigation, custom fonts, saving, and mathematical formula support—all while maintaining a responsive, mobile-friendly design.

## Key Features

### Core Functionality
- **Predictive Text Engine:** Custom-built fourgram model with trigram model, bigram, and unigram fallback strategies
- **Rich Text Editing:** Powered by Quill.js with support for formatting, lists, and KaTeX mathematical formulas
- **File System Integration:** Native browser File System Access API for seamless local file operations
- **Document Management:** Hierarchical folder structure with collapsible navigation

### User Experience
- **Intelligent Predictions:** Prediction options appears at the bottom of the screen; press Tab to accept or continue typing to dismiss
- **Dark/Light Themes:** System-aware theme switching with custom color palettes
- **Custom Typography:** Multiple font families and adjustable text sizing
- **Editor Statistics:** Real-time word count and reading time estimates
- **Spell Checking:** Native browser spell checker with visual indicators
- **Responsive Design:** Fully functional on desktop, tablet, and mobile devices

## Tech Stack

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Next.js 14** | React framework | App router for efficient routing, optimized builds, simple Vercel deployment |
| **TypeScript** | Type safety | Enhanced code reliability and developer experience |
| **Quill.js** | Rich text editor | Robust API for text manipulation, cursor management, and extensibility |
| **Tailwind CSS** | Styling | Utility-first approach for rapid, maintainable UI development |
| **Custom N-gram Model** | Prediction engine | Trigram-based language model trained on literary and encyclopedic corpora |
| **File System Access API** | Local file operations | Direct filesystem interaction without upload/download friction |

## Technical Highlights

### Prediction System
- **Training Data:** 10 books from Project Gutenberg
- **Model Architecture:** Fourgram model with intelligent fallback (fourgram → trigram → bigram → unigram)
- **Build Process:** Custom Node.js preprocessing pipeline (`buildModels.ts`) for corpus tokenization
- **Data Structures:** Efficient TypeScript interfaces (`NGramModel`, `NGramEntry`) for fast lookup

### Architecture
- **Component-Based:** Modular React components with clear separation of concerns
- **Custom Hooks:** `useFileOperations` and `useFileTrees` hooks abstract complex state management
- **Dynamic Imports:** Code-splitting for Quill.js to optimize initial load time
- **Type-Safe:** Comprehensive TypeScript interfaces for file system operations and editor state

### File Management
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
