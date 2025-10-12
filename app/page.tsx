'use client';

import Image from "next/image";
import Header from "@/components/Header";
import RichTextEditor from "@/components/RichTextEditor";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/6 bg-white dark:bg-tertiary border-r"></div>
        <RichTextEditor />
      </div>
    </div>
  );
}
