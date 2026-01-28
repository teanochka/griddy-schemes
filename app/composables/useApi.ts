type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: any
}

export const useApi = () => {
  const baseUrl = 'http://127.0.0.1:8000'

  const authFetch = async (url: string, options: ApiOptions = {}) => {
    const res = await fetch(`${baseUrl}${url}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    return res.json()
  }

  const createProject = (title: string) =>
    authFetch('/projects', {
      method: 'POST',
      body: {
        title,
        initial_data: { cards: [] },
      },
    })

  const getProjects = () =>
    authFetch('/projects')

  const inviteUser = (projectId: number, emailOrNick: string) =>
    authFetch(`/projects/${projectId}/invite`, {
      method: 'POST',
      body: {
        email_or_nickname: emailOrNick,
      },
    })

  return { createProject, getProjects, inviteUser }
}
