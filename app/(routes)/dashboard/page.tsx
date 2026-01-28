'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from './_components/ProjectCard'
import { useApi } from '@/app/composables/useApi'
import { useAuth } from '@/app/composables/useAuth'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid'

interface Project {
  id: number
  title: string
  owner: { id: number; nickname: string }
  created_at: string
  allowed_users: Array<{ id: number; nickname: string }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { getProjects, createProject } = useApi()

  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [inviteInput, setInviteInput] = useState('')

  const [sortOpen, setSortOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Не удалось загрузить проекты')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreate = async () => {
    if (!newProjectTitle.trim()) return
    setIsCreating(true)
    try {
      const newProj = await createProject(newProjectTitle)
      setProjects((prev) => [newProj, ...prev])
      setNewProjectTitle('')
      setInviteEmails([])
      setInviteInput('')
      setIsCreating(false)
    } catch (err) {
      console.error(err)
      setError('Ошибка создания проекта')
      setIsCreating(false)
    }
  }

  const handleAddInvite = () => {
    const email = inviteInput.trim()
    if (email && !inviteEmails.includes(email)) {
      setInviteEmails((prev) => [...prev, email])
    }
    setInviteInput('')
  }

  const handleRemoveInvite = (email: string) => {
    setInviteEmails((prev) => prev.filter((e) => e !== email))
  }

  const sortedProjects = [...projects].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
      )}

      {/* Create project + Sort */}
      <div className="flex justify-between items-start mb-6 max-w-4xl mx-auto gap-4">
        {/* Создание проекта */}
        <div className="flex-1 relative">
          <Button
            onClick={() => setIsCreating((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {isCreating ? 'Отмена' : 'Создать проект'}
          </Button>

          {isCreating && (
            <div className="mt-4 bg-white border border-gray-200 shadow-lg rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="Название проекта"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="w-full mb-2 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              {/* Приглашения */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-1 mb-1 min-h-6">
                  {inviteEmails.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm animate-in fade-in zoom-in duration-200"
                    >
                      {email}
                      <XMarkIcon
                        className="w-3 h-3 cursor-pointer hover:text-blue-900 transition-colors"
                        onClick={() => handleRemoveInvite(email)}
                      />
                    </span>
                  ))}
                </div>
                <input
                  type="email"
                  placeholder="Пригласить (email)"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInvite()}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newProjectTitle.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Создать
              </Button>
            </div>
          )}
        </div>

        {/* Сортировка */}
        <div className="relative">
          <Button
            onClick={() => setSortOpen((prev) => !prev)}
            className="flex items-center gap-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Sort by: {sortBy === 'date' ? 'Date' : 'Title'}
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`} />
          </Button>
          {sortOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-lg z-10 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setSortBy('date')
                  setSortOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                Date
              </button>
              <button
                onClick={() => {
                  setSortBy('title')
                  setSortOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                Title
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {isLoading ? (
        <div className="text-center text-gray-500 mt-10">Загрузка проектов...</div>
      ) : sortedProjects.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          У вас пока нет проектов. Создайте первый!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((p) => (
            <ProjectCard key={p.id} project={p} userId={user?.user_id} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  )
}