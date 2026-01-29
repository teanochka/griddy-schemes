// components/comments/NewComment.tsx
"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";

export const NewComment = () => {
  const [isPlacing, setIsPlacing] = useState(false);
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  const [content, setContent] = useState("");
  const [showInput, setShowInput] = useState(false);
  
  const params = useParams();
  const { user } = useAuth();
  const projectId = params.projectId as string;
  const { addComment } = useComments(projectId, user?.nickname);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!isPlacing) return;
    
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });
    setShowInput(true);
    setIsPlacing(false);
  }, [isPlacing]);

  const handleSubmit = useCallback(() => {
    if (!position || !content.trim() || !user) return;
    
    addComment({
      x: position.x,
      y: position.y,
      content: content.trim(),
      userId: user.id.toString(),
      userNickname: user.nickname,
      resolved: false,
      zIndex: 1000, // Базовый z-index
    });
    
    setContent("");
    setShowInput(false);
    setPosition(null);
  }, [position, content, user, addComment]);

  return (
    <>
      {/* Кнопка добавления комментария */}
      <button
        onClick={() => setIsPlacing(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700 z-50"
        title="Добавить комментарий"
      >
        💬
      </button>
      
      {isPlacing && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-500 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: position?.x || 0,
              top: position?.y || 0,
            }}
          />
        </div>
      )}
      
      {/* Форма для ввода комментария */}
      {showInput && position && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-64"
          style={{
            left: position.x + 20,
            top: position.y + 20,
          }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите комментарий..."
            className="w-full border border-gray-300 rounded p-2 text-sm resize-none mb-2"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex-1 bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700 disabled:bg-gray-300"
            >
              Добавить
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setPosition(null);
                setContent("");
              }}
              className="flex-1 bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      
      {/* Слушатель кликов на canvas */}
      <div 
        className={`fixed inset-0 ${isPlacing ? 'block' : 'hidden'}`}
        onClick={handleCanvasClick}
      />
    </>
  );
};