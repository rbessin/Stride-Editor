This is a freshman year project by Raphael Bessin at Northeastern; its goal is to explore word prediction and web development.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Tech Stack
Next.js 14 - Framework (easy routing, fast deployment)
Quill.js - Editor (simple API text editor, handles cursor/text manipulation)
Tailwind CSS - Styling (modular, mixed with css)
Custom N-gram Model - Predictions (trigrams, with predictions)
Training - Gutenberg & Wikipedia (100 books + full database)

## Project Plan

### Design & UX
Layout: VS-Code like, centered editor, minimal toolbar, sidebar for document and folder navigation
Ghost Text: Light gray text appears after cursor, disappears on any key except Tab
Quality of life: Information located at the bottom of the editor
Key Interaction: Type → See prediction → Press Tab to accept OR keep typing to dismiss

### Requirements / MVP Features
+ Text editor with basic formatting X
+ Real-time next-word predictions X
+ Tab key accepts prediction X
+ Save/load documents (localStorage) X
+ Quality of life (word count, toolbar with features) X

### Implementation Checklist / Additional Features
+ Dark/light mode toggle X
+ Folder and document navigation in sidebar X
+ Mobile friendly design
+ Loading states X
+ Vercel deployment X
+ Reading time estimates X
+ Spell checker X
+ Auto-save
+ Improve export options (pdf, markdown, plain text, html) and file saving
+ Sidebar scaling
+ Custom fonts and sizing X
+ Optional toggle for line numbers
