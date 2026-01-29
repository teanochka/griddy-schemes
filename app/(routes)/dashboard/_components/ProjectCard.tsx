'use client'

import Link from "next/link";

interface Project {
  id: number;
  title: string;
  owner: { id: number; nickname: string };
  created_at: string;
  allowed_users: Array<{ id: number; nickname: string }>;
}

interface ProjectCardProps {
  project: Project;
  userId?: number;
  formatDate: (dateString: string) => string;
}

export const ProjectCard = ({ project, userId, formatDate }: ProjectCardProps) => {
  return (
    <Link
      href={`/editor`}
      className="block bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition">{project.title}</h3>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">#{project.id}</span>
      </div>
      <div className="text-sm text-gray-600 space-y-2">
        <p className="flex items-center gap-2">
          <span className="text-gray-400">Создал:</span>
          <span className="font-medium text-black">{project.owner.nickname}</span>
          {project.owner.id === userId && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 rounded">Вы</span>
          )}
        </p>
        <p className="flex items-center gap-2">
          <span className="text-gray-400">Дата:</span>
          <span>{formatDate(project.created_at)}</span>
        </p>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Доступ имеют:</p>
          <div className="flex flex-wrap gap-1">
            {project.allowed_users.map((u) => (
              <span
                key={u.id}
                className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 border"
              >
                {u.nickname}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
