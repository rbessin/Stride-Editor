'use client';

import { useState, useRef } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Loading from "@/components/layout/Loading"
import RichTextEditor from "@/components/editor/RichTextEditor";
import { ResizeHandle } from "@/components/layout/ResizeHandle";

export default function Home() {
  // Set current file, file load status, sidebar width, editor content reference
  const [currentFile, setCurrentFile] = useState<{
    content: string;
    name: string;
    handle: FileSystemFileHandle | null;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const editorContentRef = useRef<(() => Promise<{ content: string; fileName: string }>) | null>(null);
  // Updates the currently selected file
  const handleFileSelect = (content: string, fileName: string, fileHandle: FileSystemFileHandle | null) => {
    setCurrentFile({ content, name: fileName, handle: fileHandle });
  };
  // Returns the current open file and its content
  const handleSaveRequest = async () => {
    if (editorContentRef.current) {
      return await editorContentRef.current();
    }
    return { content: '', fileName: currentFile?.name || 'untitled.txt' };
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          width={sidebarWidth}
          onFileSelect={handleFileSelect}
          onLoadingChange={setIsLoadingFile}
          onSaveRequest={handleSaveRequest}
        />
        <ResizeHandle 
          onResize={setSidebarWidth}
          minWidth={150}
          maxWidth={600}
        />
        <RichTextEditor 
          fileContent={currentFile?.content} 
          fileName={currentFile?.name}
          onContentChange={(getContent) => {editorContentRef.current = getContent;}}
        />
        
        {isLoadingFile && (<Loading type="file" styling='absolute inset-0'/>)}
      </div>
    </div>
  );
}