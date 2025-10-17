'use client';

import { useState, useRef } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Loading from "@/components/layout/Loading"
import RichTextEditor from "@/components/editor/RichTextEditor";

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
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          onFileSelect={handleFileSelect}
          onLoadingChange={setIsLoadingFile}
          onSaveRequest={handleSaveRequest}
        />
        <RichTextEditor 
          fileContent={currentFile?.content} 
          fileName={currentFile?.name}
          onContentChange={(getContent) => {editorContentRef.current = getContent;}}
        />
        
        {isLoadingFile && (<Loading />)}
      </div>
    </div>
  );
}