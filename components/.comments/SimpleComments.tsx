// components/comments/SimpleComment.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

type SimpleCommentProps = {
  comment: {
    id: string;
    x: number;
    y: number;
    content: string;
    userNickname: string;
    resolved: boolean;
  };
  onResolve: (id: string) => void;
};

export const SimpleComment = ({ comment, onResolve }: SimpleCommentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (comment.resolved) return null;

  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: comment.x,
        top: comment.y,
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-blue-500">
          <span className="text-xs font-bold">💬</span>
        </div>
        
        {isOpen && (
          <div className="absolute left-10 top-0 min-w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                <span className="text-sm font-medium">{comment.userNickname}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(comment.id);
                }}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                resolved
              </button>
            </div>
            <div className="text-sm text-gray-700">
              {comment.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};