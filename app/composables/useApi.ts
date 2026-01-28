type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: any
}

export const useApi = () => {
  const authFetch = async (url: string, options: ApiOptions = {}) => {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }

    return res.json()
  }

  const createProject = (title: string) =>
    authFetch('/api/projects', {
      method: 'POST',
      body: {
        title,
        initial_data: { cards: [] },
      },
    })

  const getProjects = () =>
    authFetch('/api/projects')

  const inviteUser = (projectId: number, emailOrNick: string) =>
    authFetch(`/api/projects/${projectId}/invite`, {
      method: 'POST',
      body: {
        email_or_nickname: emailOrNick,
      },
    })

  return { createProject, getProjects, inviteUser }
}