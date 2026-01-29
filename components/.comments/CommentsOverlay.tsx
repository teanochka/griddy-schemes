"use client";

import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { SimpleComment } from "./SimpleComment";
import { NewComment } from "./NewComment";

export const CommentsOverlay = () => {
  const params = useParams();
  const { user } = useAuth();
  const projectId = params.projectId as string;
  
  const { comments, resolveComment, isLoading } = useComments(projectId, user?.nickname);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Загрузка комментариев...</div>;
  }

  const activeComments = comments.filter(comment => !comment.resolved);

  return (
    <>
      {/* Добавление нового комментария */}
      <NewComment />
      
      {/* Отображение существующих комментариев */}
      {activeComments.map((comment) => (
        <SimpleComment
          key={comment.id}
          comment={comment}
          onResolve={resolveComment}
        />
      ))}
    </>
  );
};