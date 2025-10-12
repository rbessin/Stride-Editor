'use client';

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "@/components/RichTextEditor";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <RichTextEditor />
      </div>
    </div>
  );
}
