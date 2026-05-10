/**
 * API客户端
 * 封装所有后端API调用
 */

const API_BASE = '/api'

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.error || '请求失败')
  }
  return data
}

// 卡牌API
export const cardsApi = {
  list: (params?: Record<string, string>) =>
    fetchApi<{ data: any[] }>(`/cards?${new URLSearchParams(params).toString()}`),
  search: (q: string) =>
    fetchApi<{ data: any[]; count: number }>(`/cards/search?q=${encodeURIComponent(q)}`),
  getById: (id: string) =>
    fetchApi<{ data: any }>(`/cards/${id}`),
  compare: (id1: string, id2: string) =>
    fetchApi<{ data: any }>(`/cards/compare?id1=${id1}&id2=${id2}`),
}

// 敌人API
export const enemiesApi = {
  list: (params?: Record<string, string>) =>
    fetchApi<{ data: any[] }>(`/enemies?${new URLSearchParams(params).toString()}`),
  search: (q: string) =>
    fetchApi<{ data: any[]; count: number }>(`/enemies/search?q=${encodeURIComponent(q)}`),
  getById: (id: string) =>
    fetchApi<{ data: any }>(`/enemies/${id}`),
}

// 遗物API
export const relicsApi = {
  list: (params?: Record<string, string>) =>
    fetchApi<{ data: any[] }>(`/relics?${new URLSearchParams(params).toString()}`),
  getById: (id: string) =>
    fetchApi<{ data: any }>(`/relics/${id}`),
}

// AI问答API
export const aiApi = {
  recognize: (image: string) =>
    fetchApi<{ data: any }>('/ai/recognize', {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),
  strategy: (payload: any) =>
    fetchApi<{ data: any }>('/ai/strategy', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

// QA历史记录API
export const qaHistoryApi = {
  list: (params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.append('limit', String(params.limit))
    if (params?.offset) search.append('offset', String(params.offset))
    const qs = search.toString()
    return fetchApi<{ data: any[] }>(`/ai/history${qs ? '?' + qs : ''}`)
  },
}

// 对局记录API
export const sessionsApi = {
  list: () =>
    fetchApi<{ data: any[] }>('/sessions'),
  create: (payload: any) =>
    fetchApi<{ data: any }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getById: (id: string) =>
    fetchApi<{ data: any }>(`/sessions/${id}`),
  addScreenshot: (id: string, payload: any) =>
    fetchApi<{ data: any }>(`/sessions/${id}/screenshots`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

// 系统配置API
export const configApi = {
  getAi: () =>
    fetchApi<{ data: any }>('/config/ai'),
  updateAi: (payload: any) =>
    fetchApi<{ data: any }>('/config/ai', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  testAi: (payload: any) =>
    fetchApi<{ data: any }>('/config/ai/test', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
