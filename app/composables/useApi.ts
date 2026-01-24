export const useApi = () => {
    const { token } = useAuth()

    const authFetch = (url, options = {}) => {
        return $fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token.value}`
            }
        })
    }

    const createProject = (title) => {
        return authFetch('/api/projects', {
            method: 'POST',
            body: { title, initial_data: { cards: [] } }
        })
    }

    const getProjects = () => {
        return authFetch('/api/projects')
    }

    const inviteUser = (projectId, emailOrNick) => {
        return authFetch(`/api/projects/${projectId}/invite`, {
            method: 'POST',
            body: { email_or_nickname: emailOrNick }
        })
    }

    return { createProject, getProjects, inviteUser }
}