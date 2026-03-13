const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),

  // Leagues
  getLeagues: () => request('/leagues'),
  getLeague: (id) => request(`/leagues/${id}`),
  createLeague: (name, season) => request('/leagues', { method: 'POST', body: JSON.stringify({ name, season }) }),
  deleteLeague: (id) => request(`/leagues/${id}`, { method: 'DELETE' }),

  // Teams
  getTeams: (leagueId) => request(`/teams?league_id=${leagueId}`),
  createTeam: (name, leagueId) => request('/teams', { method: 'POST', body: JSON.stringify({ name, league_id: leagueId }) }),
  deleteTeam: (id) => request(`/teams/${id}`, { method: 'DELETE' }),
  assignAdmin: (teamId, username, password) => request(`/teams/${teamId}/admin`, { method: 'POST', body: JSON.stringify({ username, password }) }),

  // Matches
  getMatches: (leagueId) => request(`/matches?league_id=${leagueId}`),
  generateFixtures: (leagueId) => request('/matches/generate', { method: 'POST', body: JSON.stringify({ league_id: leagueId }) }),
  updateScore: (matchId, homeScore, awayScore) => request(`/matches/${matchId}/score`, { method: 'PUT', body: JSON.stringify({ home_score: homeScore, away_score: awayScore }) }),

  // Standings
  getStandings: (leagueId) => request(`/standings?league_id=${leagueId}`),
};
