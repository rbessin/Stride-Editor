'use client';

import { useState, useRef } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "@/components/RichTextEditor";

export default function Home() {
  const [currentFile, setCurrentFile] = useState<{
    content: string;
    name: string;
    handle: FileSystemFileHandle | null;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const editorContentRef = useRef<(() => Promise<{ content: string; fileName: string }>) | null>(null);

  const handleFileSelect = (content: string, fileName: string, fileHandle: FileSystemFileHandle | null) => {
    setCurrentFile({ content, name: fileName, handle: fileHandle });
  };

  const handleSaveRequest = async () => {
  if (editorContentRef.current) {
    return await editorContentRef.current();
  }
    return { content: '', fileName: currentFile?.name || 'untitled.txt' };
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          onFileSelect={handleFileSelect}
          onLoadingChange={setIsLoadingFile}
          onSaveRequest={handleSaveRequest}
        />
        <RichTextEditor 
          fileContent={currentFile?.content} 
          fileName={currentFile?.name}
          onContentChange={(getContent) => {
            editorContentRef.current = getContent;
          }}
        />
        
        {isLoadingFile && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg">
              <p className="text-lg">Loading file...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}