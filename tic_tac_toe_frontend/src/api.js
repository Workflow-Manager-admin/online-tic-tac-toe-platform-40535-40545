//
// API utility module for the Tic Tac Toe frontend
// Handles authentication (register, login), token persistence, and
// communication with backend REST API for game, history, and scoreboard.
//

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'; // Backend base

// Retrieve token from localStorage
export function getToken() {
  return localStorage.getItem('tictactoe_token');
}

// Save token to localStorage
export function setToken(token) {
  localStorage.setItem('tictactoe_token', token);
}

// Remove token (logout)
export function clearToken() {
  localStorage.removeItem('tictactoe_token');
}

// Helper for HTTP requests with optional auth
async function apiFetch(path, { method = 'GET', body, auth = true, contentType = 'application/json' } = {}) {
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (auth && getToken()) headers['Authorization'] = 'Bearer ' + getToken();
  const opts = {
    method,
    headers,
  };
  if (body) {
    opts.body = contentType === 'application/json' ? JSON.stringify(body) : body;
  }

  const res = await fetch(API_BASE_URL + path, opts);

  if (res.status >= 400) {
    let msg = 'API error';
    try {
      const err = await res.json();
      msg = (err.detail && typeof err.detail === "string") ? err.detail : JSON.stringify(err);
    } catch (e) { /* fallback */ }
    throw new Error(msg || res.statusText);
  }
  if (res.status === 204) return null;
  const contentTypeHeader = res.headers.get('Content-Type');
  if (contentTypeHeader && contentTypeHeader.indexOf('application/json') !== -1) {
    return await res.json();
  }
  return res.text();
}

// PUBLIC_INTERFACE
export async function registerUser(username, password) {
  // Register endpoint: POST /register
  return await apiFetch('/register', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
}

// PUBLIC_INTERFACE
export async function loginUser(username, password) {
  // Login endpoint: POST /login (form-encoded)
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);
  return await apiFetch('/login', {
    method: 'POST',
    body,
    contentType: 'application/x-www-form-urlencoded',
    auth: false,
  });
}

// PUBLIC_INTERFACE
export async function startGame({ opponent, asPlayer }) {
  // POST /game
  return await apiFetch('/game', {
    method: 'POST',
    body: { opponent: opponent || null, as_player: asPlayer || null },
    auth: true,
  });
}

// PUBLIC_INTERFACE
export async function getGame(gameId) {
  // GET /game/:id
  return await apiFetch(`/game/${gameId}`, {
    method: 'GET',
    auth: true,
  });
}

// PUBLIC_INTERFACE
export async function makeMove(gameId, x, y) {
  // POST /game/:id/move
  return await apiFetch(`/game/${gameId}/move`, {
    method: 'POST',
    body: { x, y },
    auth: true,
  });
}

// PUBLIC_INTERFACE
export async function listMyGames() {
  // GET /games
  return await apiFetch('/games', { auth: true });
}

// PUBLIC_INTERFACE
export async function getGameHistory(gameId) {
  // GET /game/:id/history
  return await apiFetch(`/game/${gameId}/history`, { auth: true });
}

// PUBLIC_INTERFACE
export async function getScoreboard() {
  // GET /scoreboard
  return await apiFetch('/scoreboard', { auth: true });
}

// PUBLIC_INTERFACE
export async function healthCheck() {
  // GET /
  return await apiFetch('/', { auth: false });
}
