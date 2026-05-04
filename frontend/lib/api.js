const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  // Remove body for GET requests
  if (config.method === "GET") {
    delete config.body
  }

  const response = await fetch(url, config)

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Request failed" }))
    throw new Error(error.detail || `HTTP error ${response.status}`)
  }

  return response.json()
}

// =========================
// QUERY APIs
// =========================
export async function queryHybrid(query, options = {}) {
  return fetchApi("/query/", {
    method: "POST",
    body: JSON.stringify({ query, ...options }),
  })
}

export async function queryGraph(query, options = {}) {
  return fetchApi("/query/graph-only/", {
    method: "POST",
    body: JSON.stringify({ query, ...options }),
  })
}

export async function queryVector(query, options = {}) {
  return fetchApi("/query/vector-only/", {
    method: "POST",
    body: JSON.stringify({ query, ...options }),
  })
}

export async function queryCompare(query) {
  return fetchApi("/query/compare/", {
    method: "POST",
    body: JSON.stringify({ query }),
  })
}

// =========================
// DOCUMENT APIs
// =========================
// =========================
// DOCUMENT APIs
// =========================

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append("file", file)

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  const response = await fetch(`${BASE_URL}/documents/upload/`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (response.status === 401) {
    localStorage.removeItem("token")
    window.location.href = "/login"
    return
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Upload failed" }))
    throw new Error(error.detail || `HTTP error ${response.status}`)
  }

  return response.json()
}

export async function getDocuments() {
  return fetchApi("/documents/", {
    method: "GET",
  })
}

// DELETE DOCUMENT
export async function deleteDocument(docId) {
  return fetchApi(`/documents/${docId}/`, {
    method: "DELETE",
  })
}

// =========================
// GRAPH APIs
// =========================
export async function getGraph() {
  return fetchApi("/graph/", {
    method: "GET",
  })
}

export async function getEntity(name) {
  return fetchApi(`/graph/entity/${encodeURIComponent(name)}/`, {
    method: "GET",
  })
}

export async function getPath(source, target) {
  return fetchApi(
    `/graph/path/?source=${encodeURIComponent(
      source
    )}&target=${encodeURIComponent(target)}`,
    { method: "GET" }
  )
}

export async function executeCypher(query) {
  return fetchApi("/graph/cypher/", {
    method: "POST",
    body: JSON.stringify({ query }),
  })
}

export async function getStats() {
  return fetchApi("/graph/stats/", {
    method: "GET",
  })
}

export async function getCommunities() {
  return fetchApi("/graph/communities/", {
    method: "GET",
  })
}

// SEARCH ENTITY
export async function searchEntities(query) {
  return fetchApi(`/graph/search/?q=${encodeURIComponent(query)}`, {
    method: "GET",
  })
}

// =========================
// EVALUATION
// =========================
export async function getEvaluation() {
  return fetchApi("/evaluation/", {
    method: "GET",
  })
}

// =========================
// SYSTEM
// =========================
export async function checkHealth() {
  return fetchApi("/health/", {
    method: "GET",
  })
}

// =========================
// AUTH APIs
// =========================

// REGISTER
export async function registerUser(username, password) {
  return fetchApi("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

// LOGIN
export async function loginUser(username, password) {
  return fetchApi("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

